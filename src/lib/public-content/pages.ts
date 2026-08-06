import { prisma } from "@/lib/prisma";

export function findPublishedPageBySlug(slug: string, languageCode?: "en" | "fa") {
    return prisma.page.findFirst({
        where: {
            slug,
            publishState: "published",
        },
        include: {
            translations: languageCode ? { where: { languageCode } } : true,
            sections: {
                where: { enabled: true },
                orderBy: [{ order: "asc" }, { id: "asc" }],
                include: {
                    translations: languageCode ? { where: { languageCode } } : true,
                    cards: {
                        where: { publishState: "published" },
                        orderBy: [{ order: "asc" }, { id: "asc" }],
                        include: {
                            translations: languageCode ? { where: { languageCode } } : true,
                            media: true,
                        },
                    },
                },
            },
        },
    });
}
