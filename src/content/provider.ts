import { createContentAdapter } from "./adapters/factory";
import type { ContentAdapter, AppPageContent } from "./adapters/types";
import { createCmsContentService } from "./cms";
import type { CmsContentService } from "./cms";
import type { DomainContentModel } from "./domain";
import type { MetadataContent } from "./metadata";

export type { AppPageContent } from "./adapters/types";

export interface ContentProvider {
  getPageContent(lang?: string | null): AppPageContent;
  getMetadata(lang?: string | null): MetadataContent;
  getDomainContent(lang?: string | null): DomainContentModel;
  getCmsService(): CmsContentService;
}

export class LocalContentProvider implements ContentProvider {
  private readonly cmsService: CmsContentService;

  constructor(
    private readonly adapter: ContentAdapter = createContentAdapter(),
    cmsService: CmsContentService = createCmsContentService(),
  ) {
    this.cmsService = cmsService;
  }

  getPageContent(lang?: string | null): AppPageContent {
    return this.adapter.getPageContent(lang);
  }

  getMetadata(lang?: string | null): MetadataContent {
    return this.adapter.getMetadata(lang);
  }

  getDomainContent(lang?: string | null): DomainContentModel {
    return this.adapter.getDomainContent(lang);
  }

  getCmsService(): CmsContentService {
    return this.cmsService;
  }
}

export function createContentProvider(): ContentProvider {
  return new LocalContentProvider();
}

export const contentProvider = createContentProvider();
