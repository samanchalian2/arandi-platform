import type { MetadataRoute } from "next";

import { getSiteOrigin } from "@/lib/pageMetadata";
import { prisma } from "@/lib/prisma";

const SAFE_ROUTE = /^\/(?:[a-z0-9][a-z0-9/-]*)?$/;
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLLECTIONS = ["services", "solutions", "industries", "projects"] as const;

function sourceKey(value: unknown): string | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const key = (value as Record<string, unknown>).sourceKey;
    return typeof key === "string" && SAFE_SLUG.test(key) ? key : null;
}

function localizedEntries(
    origin: string,
    path: string,
    lastModified: Date,
    priority: number,
): MetadataRoute.Sitemap {
    const url = (language: "en" | "fa") => `${origin}${path}?lang=${language}`;
    const languages = { en: url("en"), fa: url("fa"), "x-default": url("en") };
    return (["en", "fa"] as const).map((language) => ({
        url: url(language),
        lastModified,
        changeFrequency: path === "/" ? "weekly" as const : "monthly" as const,
        priority,
        alternates: { languages },
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const origin = getSiteOrigin();
    const [pages, collectionPages] = await Promise.all([
        prisma.page.findMany({
            where: {
                publishState: "published",
                translations: {
                    some: { languageCode: "en" },
                },
            },
            select: {
                route: true,
                updatedAt: true,
                translations: { select: { languageCode: true } },
            },
        }),
        prisma.page.findMany({
            where: {
                slug: { in: [...COLLECTIONS] },
                publishState: "published",
            },
            select: {
                slug: true,
                sections: {
                    where: { enabled: true },
                    select: {
                        cards: {
                            where: {
                                publishState: "published",
                                translations: {
                                    some: { languageCode: "en" },
                                },
                            },
                            select: {
                                payload: true,
                                updatedAt: true,
                                translations: { select: { languageCode: true } },
                            },
                        },
                    },
                },
            },
        }),
    ]);

    const entries: MetadataRoute.Sitemap = [];
    const seen = new Set<string>();
    for (const page of pages) {
        if (
            !SAFE_ROUTE.test(page.route)
            || !page.translations.some(({ languageCode }) => languageCode === "en")
            || !page.translations.some(({ languageCode }) => languageCode === "fa")
            || seen.has(page.route)
        ) continue;
        seen.add(page.route);
        entries.push(...localizedEntries(origin, page.route, page.updatedAt, page.route === "/" ? 1 : 0.8));
    }
    const latestPageUpdate = pages.reduce(
        (latest, page) => page.updatedAt > latest ? page.updatedAt : latest,
        new Date(0),
    );
    for (const route of ["/articles", "/knowledge", "/legal"]) {
        if (seen.has(route)) continue;
        seen.add(route);
        entries.push(...localizedEntries(origin, route, latestPageUpdate, 0.8));
    }
    for (const page of collectionPages) {
        if (!COLLECTIONS.includes(page.slug as typeof COLLECTIONS[number])) continue;
        for (const card of page.sections.flatMap((section) => section.cards)) {
            const slug = sourceKey(card.payload);
            if (
                !slug
                || !card.translations.some(({ languageCode }) => languageCode === "en")
                || !card.translations.some(({ languageCode }) => languageCode === "fa")
            ) continue;
            const route = `/${page.slug}/${slug}`;
            if (seen.has(route)) continue;
            seen.add(route);
            entries.push(...localizedEntries(origin, route, card.updatedAt, 0.7));
        }
    }
    return entries.sort((first, second) => first.url.localeCompare(second.url));
}
