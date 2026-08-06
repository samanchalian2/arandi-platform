CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "Theme" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "tokens" JSONB NOT NULL,
    "semanticTokens" JSONB NOT NULL,
    "componentOverrides" JSONB NOT NULL,
    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Language" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Page" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "pageType" TEXT NOT NULL,
    "publishState" TEXT NOT NULL DEFAULT 'published',
    "seoKeywords" TEXT[],
    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PageTranslation" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pageId" UUID NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "seoTitle" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,
    CONSTRAINT "PageTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Section" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pageId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "style" JSONB NOT NULL,
    "payload" JSONB NOT NULL,
    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SectionTranslation" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectionId" UUID NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "data" JSONB NOT NULL,
    CONSTRAINT "SectionTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Card" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectionId" UUID,
    "key" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "publishState" TEXT NOT NULL DEFAULT 'published',
    "tags" TEXT[],
    "metrics" JSONB NOT NULL,
    "payload" JSONB NOT NULL,
    "mediaId" UUID,
    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CardTranslation" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cardId" UUID NOT NULL,
    "languageCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "statusBadge" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    CONSTRAINT "CardTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Navigation" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Navigation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NavigationTranslation" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "navigationId" UUID NOT NULL,
    "languageCode" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    CONSTRAINT "NavigationTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Media" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "alt" TEXT,
    "caption" TEXT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "metadata" JSONB NOT NULL,
    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Setting" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "group" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Theme_slug_key" ON "Theme"("slug");
CREATE INDEX "Theme_isDefault_idx" ON "Theme"("isDefault");
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");
CREATE INDEX "Language_isDefault_idx" ON "Language"("isDefault");
CREATE INDEX "Language_isActive_idx" ON "Language"("isActive");
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");
CREATE INDEX "Page_publishState_idx" ON "Page"("publishState");
CREATE INDEX "PageTranslation_languageCode_idx" ON "PageTranslation"("languageCode");
CREATE UNIQUE INDEX "PageTranslation_pageId_languageCode_key" ON "PageTranslation"("pageId", "languageCode");
CREATE INDEX "Section_pageId_order_idx" ON "Section"("pageId", "order");
CREATE UNIQUE INDEX "Section_pageId_key_key" ON "Section"("pageId", "key");
CREATE INDEX "SectionTranslation_languageCode_idx" ON "SectionTranslation"("languageCode");
CREATE UNIQUE INDEX "SectionTranslation_sectionId_languageCode_key" ON "SectionTranslation"("sectionId", "languageCode");
CREATE UNIQUE INDEX "Card_key_key" ON "Card"("key");
CREATE INDEX "Card_sectionId_order_idx" ON "Card"("sectionId", "order");
CREATE INDEX "Card_publishState_idx" ON "Card"("publishState");
CREATE INDEX "CardTranslation_languageCode_idx" ON "CardTranslation"("languageCode");
CREATE UNIQUE INDEX "CardTranslation_cardId_languageCode_key" ON "CardTranslation"("cardId", "languageCode");
CREATE UNIQUE INDEX "Navigation_key_key" ON "Navigation"("key");
CREATE INDEX "Navigation_order_idx" ON "Navigation"("order");
CREATE INDEX "NavigationTranslation_languageCode_idx" ON "NavigationTranslation"("languageCode");
CREATE UNIQUE INDEX "NavigationTranslation_navigationId_languageCode_key" ON "NavigationTranslation"("navigationId", "languageCode");
CREATE UNIQUE INDEX "Media_url_key" ON "Media"("url");
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");
CREATE INDEX "Setting_group_idx" ON "Setting"("group");

ALTER TABLE "PageTranslation" ADD CONSTRAINT "PageTranslation_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PageTranslation" ADD CONSTRAINT "PageTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Section" ADD CONSTRAINT "Section_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SectionTranslation" ADD CONSTRAINT "SectionTranslation_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SectionTranslation" ADD CONSTRAINT "SectionTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Card" ADD CONSTRAINT "Card_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Card" ADD CONSTRAINT "Card_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CardTranslation" ADD CONSTRAINT "CardTranslation_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CardTranslation" ADD CONSTRAINT "CardTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NavigationTranslation" ADD CONSTRAINT "NavigationTranslation_navigationId_fkey" FOREIGN KEY ("navigationId") REFERENCES "Navigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NavigationTranslation" ADD CONSTRAINT "NavigationTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
