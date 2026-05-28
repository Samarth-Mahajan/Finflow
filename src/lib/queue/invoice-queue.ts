import { Queue, Worker, type JobsOptions, type QueueOptions } from "bullmq";
import IORedis from "ioredis";
import { fileURLToPath } from "node:url";
import { InvoiceStatus } from "@prisma/client";

import {
  InvoiceExtractionError,
  extractInvoiceData,
} from "@/lib/ai/extraction";
import { prisma } from "@/lib/db/client";
import {
  persistExtractionOutcome,
  writeInvoiceStatusAuditLog,
} from "@/lib/invoices/invoice-pipeline";

export type InvoiceExtractionJobData = Readonly<{
  invoiceId: string;
  fileUrl: string;
  userId: string;
}>;

const INVOICE_QUEUE_NAME = "invoice-extraction";

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1_000,
  },
  removeOnComplete: 100,
  removeOnFail: 100,
};

let redisConnection: IORedis | null = null;
let invoiceQueue:
  | Queue<InvoiceExtractionJobData, void, typeof INVOICE_QUEUE_NAME>
  | null = null;
let invoiceWorker:
  | Worker<InvoiceExtractionJobData, void, typeof INVOICE_QUEUE_NAME>
  | null = null;

export class InvoiceQueueError extends Error {
  readonly code = "INVOICE_QUEUE_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "InvoiceQueueError";
  }
}

const getRedisConnection = (): IORedis => {
  if (redisConnection) {
    return redisConnection;
  }

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new InvoiceQueueError("REDIS_URL is required for invoice queueing.");
  }

  redisConnection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  return redisConnection;
};

export const getInvoiceQueue = (): Queue<
  InvoiceExtractionJobData,
  void,
  typeof INVOICE_QUEUE_NAME
> => {
  if (invoiceQueue) {
    return invoiceQueue;
  }

  const queueOptions: QueueOptions = {
    connection: getRedisConnection(),
    defaultJobOptions,
  };

  invoiceQueue = new Queue<InvoiceExtractionJobData, void, typeof INVOICE_QUEUE_NAME>(
    INVOICE_QUEUE_NAME,
    queueOptions,
  );

  return invoiceQueue;
};

export const enqueueInvoiceExtraction = async (
  job: InvoiceExtractionJobData,
): Promise<void> => {
  await getInvoiceQueue().add(INVOICE_QUEUE_NAME, job, {
    jobId: `invoice:${job.invoiceId}`,
  });
};

const setInvoiceStatus = async (params: {
  invoiceId: string;
  userId: string;
  previousStatus: InvoiceStatus;
  nextStatus: InvoiceStatus;
  processingError?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
}): Promise<void> => {
  await prisma.invoice.update({
    where: { id: params.invoiceId },
    data: {
      status: params.nextStatus,
      processingError:
        params.processingError === undefined ? undefined : params.processingError,
    },
  });

  await writeInvoiceStatusAuditLog({
    invoiceId: params.invoiceId,
    userId: params.userId,
    previousStatus: params.previousStatus,
    nextStatus: params.nextStatus,
    ipAddress: params.ipAddress ?? "queue-worker",
    metadata: params.metadata,
  });
};

const processInvoiceExtractionJob = async (
  jobData: InvoiceExtractionJobData,
  attemptNumber: number,
  maxAttempts: number,
): Promise<void> => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: jobData.invoiceId },
    select: {
      id: true,
      userId: true,
      status: true,
      fileUrl: true,
      fileName: true,
      mimeType: true,
    },
  });

  if (!invoice || invoice.userId !== jobData.userId) {
    throw new InvoiceQueueError("Invoice job refers to a missing invoice.");
  }

  if (
    invoice.status !== InvoiceStatus.QUEUED &&
    invoice.status !== InvoiceStatus.FAILED
  ) {
    return;
  }

  await setInvoiceStatus({
    invoiceId: invoice.id,
    userId: invoice.userId,
    previousStatus: invoice.status,
    nextStatus: InvoiceStatus.PROCESSING,
    processingError: null,
    metadata: { attemptNumber, maxAttempts },
  });

  if (!invoice.mimeType) {
    throw new InvoiceQueueError("Invoice file type is missing.");
  }

  const extraction = await extractInvoiceData({
    fileUrl: invoice.fileUrl,
    fileName: invoice.fileName,
    mimeType: invoice.mimeType,
  });

  await persistExtractionOutcome({
    invoiceId: invoice.id,
    userId: invoice.userId,
    extraction,
    ipAddress: "queue-worker",
  });
};

export const getInvoiceWorker = (): Worker<
  InvoiceExtractionJobData,
  void,
  typeof INVOICE_QUEUE_NAME
> => {
  if (invoiceWorker) {
    return invoiceWorker;
  }

  invoiceWorker = new Worker<
    InvoiceExtractionJobData,
    void,
    typeof INVOICE_QUEUE_NAME
  >(
    INVOICE_QUEUE_NAME,
    async (job) => {
      const attempts = job.opts.attempts ?? defaultJobOptions.attempts ?? 1;

      try {
        await processInvoiceExtractionJob(job.data, job.attemptsMade + 1, attempts);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Invoice extraction failed.";
        const invoice = await prisma.invoice.findUnique({
          where: { id: job.data.invoiceId },
          select: { status: true, userId: true },
        });

        if (invoice) {
          const hasRetriesRemaining = job.attemptsMade + 1 < attempts;

          await setInvoiceStatus({
            invoiceId: job.data.invoiceId,
            userId: invoice.userId,
            previousStatus: invoice.status,
            nextStatus: hasRetriesRemaining
              ? InvoiceStatus.QUEUED
              : InvoiceStatus.FAILED,
            processingError: message,
            metadata: {
              attemptNumber: job.attemptsMade + 1,
              maxAttempts: attempts,
              retryScheduled: hasRetriesRemaining,
              typedError:
                error instanceof InvoiceExtractionError ||
                error instanceof InvoiceQueueError,
            },
          });
        }

        throw error instanceof Error
          ? error
          : new InvoiceQueueError("Invoice extraction failed unexpectedly.");
      }
    },
    {
      connection: getRedisConnection(),
    },
  );

  return invoiceWorker;
};

const startWorkerProcess = async (): Promise<void> => {
  const worker = getInvoiceWorker();
  await worker.waitUntilReady();
  // Keep the process alive for BullMQ job consumption.
  process.stdin.resume();
};

const isDirectExecution =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectExecution) {
  startWorkerProcess().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
