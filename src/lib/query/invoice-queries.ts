import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  InvoiceReviewPayload,
  InvoiceStatusResponse,
} from "@/types/invoice";

// ---------------------------------------------------------------------------
// Query key factory — single source of truth for all invoice cache keys.
// ---------------------------------------------------------------------------

export const invoiceKeys = {
  all: ["invoices"] as const,
  status: (invoiceId: string) => [...invoiceKeys.all, "status", invoiceId] as const,
} as const;

// ---------------------------------------------------------------------------
// API fetch functions — thin typed wrappers around fetch.
// ---------------------------------------------------------------------------

type UploadInvoiceResult = Readonly<{
  invoiceId: string;
  status: "queued";
}>;

type ApiErrorPayload = Readonly<{
  error?: string;
}>;

class InvoiceApiError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "InvoiceApiError";
    this.statusCode = statusCode;
  }
}

const throwIfNotOk = async (response: Response, fallbackMessage: string): Promise<void> => {
  if (response.ok) {
    return;
  }

  const payload = (await response.json()) as ApiErrorPayload;
  throw new InvoiceApiError(
    payload.error ?? fallbackMessage,
    response.status,
  );
};

export const fetchInvoiceStatus = async (
  invoiceId: string,
): Promise<InvoiceStatusResponse> => {
  const response = await fetch(`/api/invoices/${invoiceId}/status`, {
    method: "GET",
    cache: "no-store",
  });

  await throwIfNotOk(response, "Unable to load invoice status.");
  return (await response.json()) as InvoiceStatusResponse;
};

export const uploadInvoice = async (file: File): Promise<UploadInvoiceResult> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/invoices/upload", {
    method: "POST",
    body: formData,
  });

  await throwIfNotOk(response, "Upload failed.");
  return (await response.json()) as UploadInvoiceResult;
};

export const retryInvoiceExtraction = async (
  invoiceId: string,
): Promise<void> => {
  const response = await fetch(`/api/invoices/${invoiceId}/retry`, {
    method: "POST",
  });

  await throwIfNotOk(response, "Retry failed.");
};

export const confirmInvoiceReview = async (params: {
  invoiceId: string;
  review: InvoiceReviewPayload;
}): Promise<void> => {
  const response = await fetch(`/api/invoices/${params.invoiceId}/confirm`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params.review),
  });

  await throwIfNotOk(response, "Unable to confirm invoice.");
};

// ---------------------------------------------------------------------------
// React Query hooks
// ---------------------------------------------------------------------------

const isTerminalStatus = (status: InvoiceStatusResponse["status"]): boolean => {
  return status === "completed" || status === "failed" || status === "needs_review";
};

const POLLING_INTERVAL_MS = 2_000;

/**
 * Polls `/api/invoices/{id}/status` every 2 seconds until the invoice
 * reaches a terminal status (completed | failed | needs_review).
 *
 * The query is disabled until an `invoiceId` is provided.
 */
export const useInvoiceStatus = (invoiceId: string | null) => {
  return useQuery({
    queryKey: invoiceKeys.status(invoiceId ?? ""),
    queryFn: () => fetchInvoiceStatus(invoiceId!),
    enabled: invoiceId !== null,
    staleTime: 0,
    refetchInterval: (query) => {
      const data = query.state.data;

      if (data && isTerminalStatus(data.status)) {
        return false;
      }

      return POLLING_INTERVAL_MS;
    },
  });
};

/**
 * Mutation to upload a new invoice file.
 *
 * On success the caller receives the new `invoiceId` which should
 * be passed to `useInvoiceStatus` to begin polling.
 */
export const useUploadInvoice = () => {
  return useMutation({
    mutationFn: uploadInvoice,
  });
};

/**
 * Mutation to retry a failed invoice extraction.
 *
 * On success the related status query is invalidated so polling restarts.
 */
export const useRetryInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryInvoiceExtraction,
    onSuccess: (_data, invoiceId) => {
      void queryClient.invalidateQueries({
        queryKey: invoiceKeys.status(invoiceId),
      });
    },
  });
};

/**
 * Mutation to confirm a reviewed invoice.
 *
 * On success the related status query is invalidated to fetch the
 * finalized state.
 */
export const useConfirmInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmInvoiceReview,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: invoiceKeys.status(variables.invoiceId),
      });
    },
  });
};
