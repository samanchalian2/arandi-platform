import { createContentAdapter } from "./adapters/factory";
import type { ContentAdapter, AppPageContent } from "./adapters/types";
import type { MetadataContent } from "./metadata";

export type { AppPageContent } from "./adapters/types";

export interface ContentProvider {
  getPageContent(lang?: string | null): AppPageContent;
  getMetadata(lang?: string | null): MetadataContent;
}

export class LocalContentProvider implements ContentProvider {
  constructor(private readonly adapter: ContentAdapter = createContentAdapter()) {}

  getPageContent(lang?: string | null): AppPageContent {
    return this.adapter.getPageContent(lang);
  }

  getMetadata(lang?: string | null): MetadataContent {
    return this.adapter.getMetadata(lang);
  }
}

export function createContentProvider(): ContentProvider {
  return new LocalContentProvider();
}

export const contentProvider = createContentProvider();
