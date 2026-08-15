import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

import { revalidatePublicContent } from "./cache";

export const PUBLIC_THEME_TAG = "public-theme";
export const THEME_PREVIEW_COOKIE = "arandi_theme_preview";

type ThemeTokenGroups = {
    colors?: Record<string, unknown>;
    typography?: Record<string, unknown>;
    spacing?: Record<string, unknown>;
    radius?: Record<string, unknown>;
    shadows?: Record<string, unknown>;
};

type ThemeSnapshot = {
    slug: string;
    name: string;
    isDefault: boolean;
    tokens: unknown;
    semanticTokens: unknown;
    componentOverrides: unknown;
};

export type PublicTheme = {
    slug: string;
    name: string;
    isPreview: boolean;
    cssVariables: Record<string, string>;
};

const SAFE_CSS_VALUE = /^(?!.*(?:url\s*\(|expression\s*\(|[;{}<>])).{1,200}$/i;
const PUBLIC_VARIABLES = new Set([
    "--background", "--foreground", "--surface", "--surface-foreground", "--card", "--card-foreground",
    "--popover", "--popover-foreground", "--primary", "--primary-foreground", "--secondary",
    "--secondary-foreground", "--muted", "--muted-foreground", "--accent", "--accent-foreground",
    "--border", "--input", "--ring", "--radius", "--radius-control", "--radius-card", "--radius-panel",
    "--radius-pill", "--elevation-1", "--elevation-2", "--elevation-3", "--glass-border", "--glass-surface",
    "--hero-gradient", "--font-body", "--font-heading", "--section-block-padding", "--section-block-padding-compact",
]);

const cachedPublishedTheme = unstable_cache(
    async (): Promise<ThemeSnapshot | null> => prisma.theme.findFirst({
        where: { isDefault: true },
        select: {
            slug: true,
            name: true,
            isDefault: true,
            tokens: true,
            semanticTokens: true,
            componentOverrides: true,
        },
    }),
    ["public-theme:published"],
    { tags: [PUBLIC_THEME_TAG] },
);

function isSafeThemeSlug(value: string | undefined): value is string {
    return Boolean(value && /^[a-z][a-z0-9-]{1,63}$/.test(value));
}

function readThemeVariables(theme: ThemeSnapshot | null): Record<string, string> {
    if (!theme) return {};
    const tokens = theme.tokens && typeof theme.tokens === "object" && !Array.isArray(theme.tokens)
        ? theme.tokens as ThemeTokenGroups
        : {};
    const groups = [tokens.colors, tokens.typography, tokens.spacing, tokens.radius, tokens.shadows];
    const variables: Record<string, string> = {};
    for (const group of groups) {
        if (!group) continue;
        for (const [key, value] of Object.entries(group)) {
            if (!PUBLIC_VARIABLES.has(key) || typeof value !== "string" || !SAFE_CSS_VALUE.test(value)) continue;
            // A self-referencing value would make the computed property invalid; the stylesheet fallback wins instead.
            if (value.trim() === `var(${key})`) continue;
            variables[key] = value.trim();
        }
    }
    return variables;
}

function toPublicTheme(theme: ThemeSnapshot | null, isPreview: boolean): PublicTheme {
    return {
        slug: theme?.slug ?? "default",
        name: theme?.name ?? "Arandi Classic",
        isPreview,
        cssVariables: readThemeVariables(theme),
    };
}

export async function getPublicTheme(previewSlug?: string): Promise<PublicTheme> {
    if (isSafeThemeSlug(previewSlug)) {
        const preview = await prisma.theme.findUnique({
            where: { slug: previewSlug },
            select: {
                slug: true,
                name: true,
                isDefault: true,
                tokens: true,
                semanticTokens: true,
                componentOverrides: true,
            },
        });
        if (preview) return toPublicTheme(preview, !preview.isDefault);
    }
    return toPublicTheme(await cachedPublishedTheme(), false);
}

export function revalidatePublicTheme(): void {
    revalidatePublicContent(PUBLIC_THEME_TAG);
}
