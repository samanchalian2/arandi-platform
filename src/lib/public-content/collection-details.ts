import {
    getPublicEnterprisePage,
    type EnterpriseCollectionKey,
} from "./enterprise-pages";

type PublicLanguage = "en" | "fa";

export type PublicCollectionDetail = {
    collection: EnterpriseCollectionKey;
    slug: string;
    title: string;
    summary: string;
    eyebrow: string;
    highlight: string | null;
};

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function getPublicCollectionDetail(
    collection: EnterpriseCollectionKey,
    slug: string,
    language: PublicLanguage,
): Promise<PublicCollectionDetail> {
    if (!SAFE_SLUG.test(slug)) throw new Error("Collection detail slug is invalid.");
    switch (collection) {
        case "services": {
            const page = await getPublicEnterprisePage("services", language);
            const item = page.cards.find((card) => card.id === slug);
            if (!item) throw new Error("Published Service is unavailable.");
            return {
                collection,
                slug,
                title: item.title,
                summary: item.summary,
                eyebrow: item.label,
                highlight: null,
            };
        }
        case "solutions": {
            const page = await getPublicEnterprisePage("solutions", language);
            const item = page.catalog.cards.find((card) => card.id === slug);
            if (!item) throw new Error("Published Solution is unavailable.");
            return {
                collection,
                slug,
                title: item.title,
                summary: item.summary,
                eyebrow: page.catalog.eyebrow,
                highlight: item.outcome,
            };
        }
        case "industries": {
            const page = await getPublicEnterprisePage("industries", language);
            const item = page.section.cards.find((card) => card.id === slug);
            if (!item) throw new Error("Published Industry is unavailable.");
            return {
                collection,
                slug,
                title: item.title,
                summary: item.summary,
                eyebrow: page.section.eyebrow,
                highlight: null,
            };
        }
        case "projects": {
            const page = await getPublicEnterprisePage("projects", language);
            const item = page.section.cards.find((card) => card.id === slug);
            if (!item) throw new Error("Published Project is unavailable.");
            return {
                collection,
                slug,
                title: item.title,
                summary: item.summary,
                eyebrow: page.section.eyebrow,
                highlight: item.impact,
            };
        }
    }
}
