import { revalidateTag } from "next/cache";

export const PUBLIC_CONTENT_TAG = "public-content";
export const PUBLIC_HOME_TAG = "public-page:home";
export const PUBLIC_NAVIGATION_TAG = "public-navigation";
export const PUBLIC_SETTINGS_TAG = "public-settings";
export const PUBLIC_THEME_TAG = "public-theme";

export function revalidatePublicContent(...tags: string[]): void {
    const uniqueTags = new Set([PUBLIC_CONTENT_TAG, ...tags]);
    for (const tag of uniqueTags) {
        try {
            revalidateTag(tag, { expire: 0 });
        } catch (error) {
            if (
                error instanceof Error
                && error.message.includes("static generation store missing")
            ) {
                continue;
            }
            console.error(`Unable to revalidate public cache tag ${tag}.`);
        }
    }
}
