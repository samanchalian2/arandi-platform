CREATE TABLE "ContactReply" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submissionId" UUID NOT NULL,
    "authorId" UUID,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "deliveryState" TEXT NOT NULL DEFAULT 'pending',
    "deliveryAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastDeliveryAt" TIMESTAMP(3),
    "deliveryProvider" TEXT,
    "providerMessageId" TEXT,
    CONSTRAINT "ContactReply_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsVisitor" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokenHash" TEXT NOT NULL,
    CONSTRAINT "AnalyticsVisitor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsSession" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorId" UUID NOT NULL,
    "languageCode" TEXT NOT NULL,
    "referrerHost" TEXT,
    "sourceCategory" TEXT NOT NULL,
    "deviceCategory" TEXT NOT NULL,
    "browserFamily" TEXT NOT NULL,
    "osFamily" TEXT NOT NULL,
    CONSTRAINT "AnalyticsSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsPageView" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    CONSTRAINT "AnalyticsPageView_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AnalyticsVisitor_tokenHash_key" ON "AnalyticsVisitor"("tokenHash");
CREATE INDEX "ContactReply_submissionId_createdAt_idx" ON "ContactReply"("submissionId", "createdAt");
CREATE INDEX "ContactReply_deliveryState_createdAt_idx" ON "ContactReply"("deliveryState", "createdAt");
CREATE INDEX "AnalyticsSession_createdAt_idx" ON "AnalyticsSession"("createdAt");
CREATE INDEX "AnalyticsSession_visitorId_createdAt_idx" ON "AnalyticsSession"("visitorId", "createdAt");
CREATE INDEX "AnalyticsSession_sourceCategory_createdAt_idx" ON "AnalyticsSession"("sourceCategory", "createdAt");
CREATE INDEX "AnalyticsPageView_createdAt_idx" ON "AnalyticsPageView"("createdAt");
CREATE INDEX "AnalyticsPageView_path_createdAt_idx" ON "AnalyticsPageView"("path", "createdAt");
CREATE INDEX "AnalyticsPageView_sessionId_createdAt_idx" ON "AnalyticsPageView"("sessionId", "createdAt");

ALTER TABLE "ContactReply" ADD CONSTRAINT "ContactReply_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ContactSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContactReply" ADD CONSTRAINT "ContactReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AnalyticsSession" ADD CONSTRAINT "AnalyticsSession_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "AnalyticsVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsPageView" ADD CONSTRAINT "AnalyticsPageView_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Setting" ("id", "createdAt", "updatedAt", "key", "value", "group", "isPublic")
SELECT '00000000-0000-4000-8000-000000000010'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'contact.notifications', '{"recipient":"info@arandi.io"}'::jsonb, 'communications', false
WHERE NOT EXISTS (SELECT 1 FROM "Setting" WHERE "key" = 'contact.notifications');
