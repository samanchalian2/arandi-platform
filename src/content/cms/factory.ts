import { createLocalCmsRepositories } from "./localRepositories";
import { createPrismaCmsRepositories } from "./prismaRepositories";
import { CmsContentService } from "./services";
import { PrismaClient } from "@prisma/client";

export type CmsRepositoryAdapterType = "local" | "prisma";

export function createCmsContentService(adapterType: CmsRepositoryAdapterType = "local"): CmsContentService {
    switch (adapterType) {
        case "prisma":
            // Synchronous service construction is preserved for backward compatibility.
            // The Prisma-backed variant is available through createPrismaCmsContentService.
            return new CmsContentService(createLocalCmsRepositories());
        case "local":
        default:
            return new CmsContentService(createLocalCmsRepositories());
    }
}

export async function createPrismaCmsContentService(prisma?: PrismaClient): Promise<CmsContentService> {
    const repositories = await createPrismaCmsRepositories(prisma);
    return new CmsContentService(repositories);
}
