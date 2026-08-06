CREATE TABLE "ContactSubmission" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reference" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organization" TEXT,
    "topic" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'received',
    "deliveryState" TEXT NOT NULL DEFAULT 'pending',
    "deliveryAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastDeliveryAt" TIMESTAMP(3),
    "deliveryProvider" TEXT,
    "providerMessageId" TEXT,
    "ipHash" TEXT,
    "userAgentHash" TEXT,
    "dedupeHash" TEXT NOT NULL,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContactSubmission_reference_key" ON "ContactSubmission"("reference");
CREATE UNIQUE INDEX "ContactSubmission_dedupeHash_key" ON "ContactSubmission"("dedupeHash");
CREATE INDEX "ContactSubmission_createdAt_idx" ON "ContactSubmission"("createdAt");
CREATE INDEX "ContactSubmission_status_createdAt_idx" ON "ContactSubmission"("status", "createdAt");
CREATE INDEX "ContactSubmission_deliveryState_createdAt_idx" ON "ContactSubmission"("deliveryState", "createdAt");
CREATE INDEX "ContactSubmission_ipHash_createdAt_idx" ON "ContactSubmission"("ipHash", "createdAt");
