import { LocalContentAdapter } from "./localContentAdapter";
import type { ContentAdapter } from "./types";

export type AdapterType = "local";

export function createContentAdapter(type: AdapterType = "local"): ContentAdapter {
  switch (type) {
    case "local":
    default:
      return new LocalContentAdapter();
  }
}
