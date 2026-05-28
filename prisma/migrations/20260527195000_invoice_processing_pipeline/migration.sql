-- CreateEnum
CREATE TYPE "AnomalySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Invoice"
ALTER COLUMN "vendorName" DROP NOT NULL,
ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "vatAmount" DROP NOT NULL,
ALTER COLUMN "vatRate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Invoice"
ADD COLUMN "anomalyReason" TEXT,
ADD COLUMN "anomalySeverity" "AnomalySeverity",
ADD COLUMN "extractionData" JSONB,
ADD COLUMN "fileName" TEXT,
ADD COLUMN "invoiceDate" TIMESTAMP(3),
ADD COLUMN "invoiceNumber" TEXT,
ADD COLUMN "isAnomaly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "mimeType" TEXT,
ADD COLUMN "overallConfidence" TEXT,
ADD COLUMN "processingError" TEXT,
ADD COLUMN "rawText" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3);
