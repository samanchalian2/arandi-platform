import { unstable_cache } from "next/cache";

import { getEnterpriseContent, type EnterpriseContentModel } from "@/content/enterprise";
import { prisma } from "@/lib/prisma";

import { PUBLIC_CONTENT_TAG, PUBLIC_SETTINGS_TAG } from "./cache";
import { publicPageTag } from "./enterprise-pages";
import { findPublishedPageBySlug } from "./pages";

export type FixedEnterprisePageKey = "company" | "contact";
export type FixedEnterprisePage<K extends FixedEnterprisePageKey> =
    EnterpriseContentModel["pages"][K];
export type PublicContactDetails = {
    primaryEmail: string;
    primaryPhone: string;
    address: string;
    mapUrl: string;
};

type PublicLanguage = "en" | "fa";
type PublishedPage = NonNullable<Awaited<ReturnType<typeof findPublishedPageBySlug>>>;

const pageLoaders: Record<
    FixedEnterprisePageKey,
    (language: PublicLanguage) => Promise<Awaited<ReturnType<typeof findPublishedPageBySlug>>>
> = {
    company: unstable_cache(
        (language: PublicLanguage) => findPublishedPageBySlug("company", language),
        ["arandi-public-company-v1"],
        { tags: [PUBLIC_CONTENT_TAG, publicPageTag("company")], revalidate: 3_600 },
    ),
    contact: unstable_cache(
        (language: PublicLanguage) => findPublishedPageBySlug("contact", language),
        ["arandi-public-contact-v1"],
        { tags: [PUBLIC_CONTENT_TAG, publicPageTag("contact")], revalidate: 3_600 },
    ),
};

const loadContactSetting = unstable_cache(
    () => prisma.setting.findFirst({
        where: { key: "site.contact", isPublic: true },
        select: { value: true },
    }),
    ["arandi-public-contact-setting-v1"],
    { tags: [PUBLIC_CONTENT_TAG, PUBLIC_SETTINGS_TAG], revalidate: 3_600 },
);

function asRecord(value: unknown, field: string): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error(`${field} must be a published object.`);
    }
    return value as Record<string, unknown>;
}

function safeGoogleMapsUrl(value: unknown, address: string): string {
    if (typeof value === "string" && /^https:\/\/(?:www\.)?google\.com\/maps\//i.test(value)) {
        return value;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function mapPublicShape(value: unknown, template: unknown, field: string): unknown {
    if (typeof template === "string") {
        if (typeof value !== "string" || value.trim().length === 0 || value.length > 4_000) {
            throw new Error(`${field} is invalid.`);
        }
        return value;
    }
    if (Array.isArray(template)) {
        if (!Array.isArray(value) || value.length === 0 || value.length > 50 || template.length === 0) {
            throw new Error(`${field} is invalid.`);
        }
        return value.map((item, index) => mapPublicShape(item, template[0], `${field}.${index}`));
    }
    const templateRecord = asRecord(template, `${field}.template`);
    const valueRecord = asRecord(value, field);
    return Object.fromEntries(
        Object.entries(templateRecord).map(([key, childTemplate]) => [
            key,
            mapPublicShape(valueRecord[key], childTemplate, `${field}.${key}`),
        ]),
    );
}

export function mapPublishedFixedPage<K extends FixedEnterprisePageKey>(
    key: K,
    page: PublishedPage,
    language: PublicLanguage,
): FixedEnterprisePage<K> {
    const pageTranslation = page.translations[0];
    const section = page.sections.find((item) => item.key === `${key}-content`);
    const sectionTranslation = section?.translations[0];
    if (!pageTranslation || !section || !sectionTranslation) {
        throw new Error(`Published ${key} content is incomplete for ${language}.`);
    }
    const template = getEnterpriseContent(language).pages[key];
    const { metadata: _metadata, ...payloadTemplate } = template;
    void _metadata;
    const payload = mapPublicShape(sectionTranslation.data, payloadTemplate, key);
    return {
        metadata: {
            title: pageTranslation.seoTitle,
            description: pageTranslation.seoDescription,
        },
        ...payload as Omit<FixedEnterprisePage<K>, "metadata">,
    } as FixedEnterprisePage<K>;
}

export async function getPublicFixedPage<K extends FixedEnterprisePageKey>(
    key: K,
    language: PublicLanguage,
): Promise<FixedEnterprisePage<K>> {
    try {
        const page = await pageLoaders[key](language);
        if (!page) throw new Error(`Published ${key} Page is unavailable.`);
        return mapPublishedFixedPage(key, page, language);
    } catch {
        if (
            process.env.NODE_ENV !== "production"
            && process.env.ARANDI_PUBLIC_CONTENT_SOURCE === "local"
        ) {
            return getEnterpriseContent(language).pages[key];
        }
        throw new Error(`Published ${key} content is unavailable.`);
    }
}

export async function getPublicContactDetails(
    language: PublicLanguage,
): Promise<PublicContactDetails> {
    const setting = await loadContactSetting();
    const localized = asRecord(asRecord(setting?.value, "site.contact")[language], `site.contact.${language}`);
    const details = mapPublicShape(
        localized,
        { email: "email", phone: "phone", address: "address" },
        `site.contact.${language}`,
    ) as { email: string; phone: string; address: string };
    return {
        primaryEmail: details.email,
        primaryPhone: details.phone,
        address: details.address,
        mapUrl: safeGoogleMapsUrl(localized.mapUrl, details.address),
    };
}
