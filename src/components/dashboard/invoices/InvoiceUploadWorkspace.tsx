"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCcw,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  useInvoiceStatus,
  useUploadInvoice,
  useRetryInvoice,
  useConfirmInvoice,
} from "@/lib/query/invoice-queries";
import type {
  ExtractionResult,
  InvoiceReviewPayload,
  InvoiceStatusResponse,
} from "@/types/invoice";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);

type ClientStatus = InvoiceStatusResponse["status"] | "idle";

const getConfidenceTone = (confidence: number): string => {
  if (confidence > 0.9) {
    return "bg-finflow-green";
  }

  if (confidence >= 0.7) {
    return "bg-amber-400";
  }

  return "bg-finflow-red";
};

const formatConfidence = (confidence: number): string => {
  return `${Math.round(confidence * 100)}%`;
};

const getValidationError = (file: File): string | null => {
  if (!allowedMimeTypes.has(file.type)) {
    return "Only PDF, PNG, and JPG files are supported.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Please upload a file that is 10MB or smaller.";
  }

  return null;
};

const buildReviewPayload = (
  extraction: ExtractionResult,
): InvoiceReviewPayload => {
  return {
    vendorName: extraction.vendorName.value,
    amount: extraction.amount.value,
    vatAmount: extraction.vatAmount.value,
    vatRate: extraction.vatRate.value,
    date: extraction.date.value,
    invoiceNumber: extraction.invoiceNumber.value,
  };
};

export function InvoiceUploadWorkspace() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<InvoiceReviewPayload | null>(null);

  // ---------------------------------------------------------------------------
  // TanStack Query hooks
  // ---------------------------------------------------------------------------

  const statusQuery = useInvoiceStatus(invoiceId);

  const uploadMutation = useUploadInvoice();
  const retryMutation = useRetryInvoice();
  const confirmMutation = useConfirmInvoice();

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const statusData = statusQuery.data ?? null;
  const status: ClientStatus = statusData?.status ?? (invoiceId ? "queued" : "idle");
  const extraction = statusData?.extraction ?? null;
  const anomaly = statusData?.anomaly ?? null;

  // Populate the review form when extraction data arrives.
  if (extraction && reviewForm === null) {
    // Safe to set during render — this runs at most once per extraction result.
    setReviewForm(buildReviewPayload(extraction));
  }

  const requestError =
    uploadMutation.error?.message ??
    retryMutation.error?.message ??
    confirmMutation.error?.message ??
    (statusQuery.error?.message ?? null);

  const isProcessing = status === "queued" || status === "processing";
  const isReviewState = status === "needs_review" && extraction !== null && reviewForm !== null;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSelectedFile = (file: File | null) => {
    if (!file) {
      return;
    }

    const error = getValidationError(file);
    setValidationError(error);

    if (error) {
      return;
    }

    // Reset state for a new upload.
    setSelectedFileName(file.name);
    setInvoiceId(null);
    setReviewForm(null);
    uploadMutation.reset();
    retryMutation.reset();
    confirmMutation.reset();

    uploadMutation.mutate(file, {
      onSuccess: (result) => {
        setInvoiceId(result.invoiceId);
      },
    });
  };

  const handleRetry = () => {
    if (!invoiceId) {
      return;
    }

    retryMutation.reset();
    retryMutation.mutate(invoiceId);
  };

  const handleConfirm = () => {
    if (!invoiceId || !reviewForm) {
      return;
    }

    confirmMutation.reset();
    confirmMutation.mutate({ invoiceId, review: reviewForm });
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="overflow-hidden rounded-3xl border border-finflow-border bg-finflow-card shadow-[var(--finflow-shadow)]">
        <div className="border-b border-finflow-border px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-finflow-teal">
                Invoice Intake
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-finflow-text">
                Upload and process supplier invoices
              </h1>
            </div>
            <div className="rounded-full border border-finflow-border bg-finflow-card-elevated px-4 py-2 text-xs text-finflow-muted">
              Async pipeline with review checkpoints
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div
            role="button"
            tabIndex={0}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              handleSelectedFile(event.dataTransfer.files[0] ?? null);
            }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={cn(
              "group relative rounded-3xl border border-dashed p-8 transition-colors",
              dragActive
                ? "border-finflow-teal bg-finflow-active"
                : "border-finflow-border bg-finflow-card-elevated/60 hover:border-finflow-teal/40 hover:bg-finflow-active/60",
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg"
              className="hidden"
              onChange={(event) => {
                handleSelectedFile(event.target.files?.[0] ?? null);
              }}
            />

            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-finflow-border bg-finflow-bg">
                <UploadCloud className="h-8 w-8 text-finflow-teal" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-finflow-text">
                Drop PDF or image files here
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-finflow-muted">
                We accept PDF, PNG, and JPG invoices up to 10MB. Upload returns
                immediately and the extraction continues in the background.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  disabled={uploadMutation.isPending}
                  className="rounded-full bg-finflow-teal px-5 text-finflow-bg hover:bg-finflow-teal-muted"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Choose File"}
                </Button>
                <span className="text-xs text-finflow-muted">
                  German VAT rates only: 0%, 7%, 19%
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-finflow-border bg-finflow-bg/70 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-finflow-border bg-finflow-card">
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin text-finflow-teal" />
                ) : status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-finflow-green" />
                ) : status === "failed" ? (
                  <AlertTriangle className="h-5 w-5 text-finflow-red" />
                ) : (
                  <FileText className="h-5 w-5 text-finflow-muted" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-finflow-text">
                  Current state
                </p>
                <p className="text-sm text-finflow-muted">
                  {selectedFileName ?? "No invoice uploaded yet"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-finflow-border bg-finflow-card p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-finflow-muted">
                  Status
                </p>
                <p className="mt-2 text-lg font-semibold capitalize text-finflow-text">
                  {status.replace("_", " ")}
                </p>
                {status === "queued" && (
                  <p className="mt-2 text-sm text-finflow-muted">
                    The invoice is in the extraction queue.
                  </p>
                )}
                {status === "processing" && (
                  <p className="mt-2 text-sm text-finflow-muted">
                    Gemini is extracting VAT, totals, and invoice metadata.
                  </p>
                )}
                {status === "needs_review" && (
                  <p className="mt-2 text-sm text-amber-300">
                    Low-confidence fields were found. Review and confirm before
                    finalizing.
                  </p>
                )}
                {status === "completed" && (
                  <p className="mt-2 text-sm text-finflow-green">
                    Extraction completed and the invoice is finalized.
                  </p>
                )}
                {status === "failed" && (
                  <p className="mt-2 text-sm text-finflow-red">
                    {statusData?.processingError ?? "Processing failed."}
                  </p>
                )}
              </div>

              {requestError && (
                <div className="rounded-2xl border border-finflow-red/30 bg-finflow-red/10 px-4 py-3 text-sm text-red-200">
                  {requestError}
                </div>
              )}

              {validationError && (
                <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                  {validationError}
                </div>
              )}

              {status === "failed" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetry}
                  disabled={retryMutation.isPending}
                  className="w-full rounded-2xl border-finflow-border bg-finflow-card text-finflow-text hover:bg-finflow-card-elevated"
                >
                  {retryMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="mr-2 h-4 w-4" />
                  )}
                  Retry Extraction
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {isProcessing && (
        <section className="rounded-3xl border border-finflow-border bg-finflow-card p-6 shadow-[var(--finflow-shadow)]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-finflow-teal" />
            <div>
              <h2 className="text-lg font-semibold text-finflow-text">
                Processing invoice
              </h2>
              <p className="text-sm text-finflow-muted">
                Polling every 2 seconds for extraction progress.
              </p>
            </div>
          </div>
        </section>
      )}

      {extraction && (
        <section className="rounded-3xl border border-finflow-border bg-finflow-card shadow-[var(--finflow-shadow)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-finflow-border px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-finflow-muted">
                Extracted Data
              </p>
              <h2 className="mt-2 text-xl font-semibold text-finflow-text">
                Confidence-aware invoice summary
              </h2>
            </div>
            <div className="rounded-full border border-finflow-border bg-finflow-card-elevated px-4 py-2 text-sm text-finflow-text">
              Overall confidence {formatConfidence(extraction.overallConfidence)}
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              {[
                {
                  key: "vendorName",
                  label: "Vendor Name",
                  value: extraction.vendorName.value,
                  confidence: extraction.vendorName.confidence,
                },
                {
                  key: "amount",
                  label: "Amount",
                  value: extraction.amount.value,
                  confidence: extraction.amount.confidence,
                },
                {
                  key: "vatAmount",
                  label: "VAT Amount",
                  value: extraction.vatAmount.value,
                  confidence: extraction.vatAmount.confidence,
                },
                {
                  key: "vatRate",
                  label: "VAT Rate",
                  value: `${extraction.vatRate.value}%`,
                  confidence: extraction.vatRate.confidence,
                },
                {
                  key: "date",
                  label: "Invoice Date",
                  value: extraction.date.value,
                  confidence: extraction.date.confidence,
                },
                {
                  key: "invoiceNumber",
                  label: "Invoice Number",
                  value: extraction.invoiceNumber.value ?? "Not detected",
                  confidence: extraction.invoiceNumber.confidence,
                },
              ].map((field) => (
                <div
                  key={field.key}
                  className={cn(
                    "rounded-2xl border p-4",
                    field.confidence < 0.85
                      ? "border-amber-400/40 bg-amber-400/10"
                      : "border-finflow-border bg-finflow-bg/70",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-finflow-muted">
                        {field.label}
                      </p>
                      <p className="mt-2 text-base font-semibold text-finflow-text">
                        {field.value}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-finflow-muted">
                      {formatConfidence(field.confidence)}
                    </span>
                  </div>
                  <Progress
                    value={field.confidence * 100}
                    className="mt-4 h-2 bg-finflow-border"
                    indicatorClassName={getConfidenceTone(field.confidence)}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-finflow-border bg-finflow-bg/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-finflow-muted">
                  OCR text
                </p>
                <p className="mt-3 max-h-56 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-finflow-muted">
                  {extraction.rawText}
                </p>
              </div>

              {anomaly?.isAnomaly && (
                <div className="rounded-2xl border border-finflow-red/30 bg-finflow-red/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-finflow-red">
                    Anomaly detected
                  </p>
                  <p className="mt-2 text-sm font-medium text-red-100">
                    Severity: {anomaly.severity}
                  </p>
                  <p className="mt-1 text-sm text-red-200">{anomaly.reason}</p>
                </div>
              )}

              {isReviewState && reviewForm && (
                <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-200">
                    Human review required
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      ["vendorName", "Vendor Name"],
                      ["amount", "Amount (EUR)"],
                      ["vatAmount", "VAT Amount (EUR)"],
                      ["date", "Invoice Date (ISO)"],
                      ["invoiceNumber", "Invoice Number"],
                    ].map(([key, label]) => (
                      <div key={key}>
                        <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-finflow-muted">
                          {label}
                        </label>
                        <Input
                          value={
                            reviewForm[key as keyof InvoiceReviewPayload] ?? ""
                          }
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            setReviewForm((current) =>
                              current
                                ? key === "vendorName"
                                  ? { ...current, vendorName: nextValue }
                                  : key === "amount"
                                    ? { ...current, amount: nextValue }
                                    : key === "vatAmount"
                                      ? { ...current, vatAmount: nextValue }
                                      : key === "date"
                                        ? { ...current, date: nextValue }
                                        : {
                                            ...current,
                                            invoiceNumber:
                                              nextValue.trim() === "" ? null : nextValue,
                                          }
                                : current,
                            );
                          }}
                          className="border-finflow-border bg-finflow-card text-finflow-text"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-finflow-muted">
                        VAT Rate
                      </label>
                      <select
                        value={reviewForm.vatRate}
                        onChange={(event) => {
                          const value = event.target.value as "0" | "7" | "19";
                          setReviewForm((current) =>
                            current ? { ...current, vatRate: value } : current,
                          );
                        }}
                        className="h-10 w-full rounded-xl border border-finflow-border bg-finflow-card px-3 text-sm text-finflow-text outline-none focus:border-finflow-teal/40"
                      >
                        <option value="0">0%</option>
                        <option value="7">7%</option>
                        <option value="19">19%</option>
                      </select>
                    </div>

                    <Button
                      type="button"
                      onClick={handleConfirm}
                      disabled={confirmMutation.isPending}
                      className="mt-2 w-full rounded-2xl bg-finflow-teal text-finflow-bg hover:bg-finflow-teal-muted"
                    >
                      {confirmMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Confirm and Finalize Invoice
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
