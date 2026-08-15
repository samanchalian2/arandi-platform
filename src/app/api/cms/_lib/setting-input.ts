import { isRecord } from "./validation";

export const EDITABLE_SETTING_KEYS = [
    "site.company",
    "site.social",
    "site.heroMedia",
    "site.seo",
    "site.contact",
    "site.logo",
    "ai.runtime",
] as const;

export type EditableSettingKey = typeof EDITABLE_SETTING_KEYS[number];

const SECRET_KEY_PATTERN = /(?:secret|password|token|credential|api[-_.]?key|private[-_.]?key|smtp|database)/i;

export function isSecretBearingSettingKey(key: string): boolean {
    return SECRET_KEY_PATTERN.test(key);
}

export function parseEditableSettingKey(value: unknown): EditableSettingKey {
    if (
        typeof value !== "string"
        || !EDITABLE_SETTING_KEYS.includes(value as EditableSettingKey)
        || isSecretBearingSettingKey(value)
    ) {
        throw new Error("Setting key is not editable.");
    }
    return value as EditableSettingKey;
}

export function parseSettingValue(value: unknown): Record<string, unknown> {
    if (!isRecord(value)) throw new Error("Setting value must be a JSON object.");
    const visit = (current: unknown, depth: number): void => {
        if (depth > 5) throw new Error("Setting value is too deeply nested.");
        if (current === null || typeof current === "boolean" || typeof current === "number") return;
        if (typeof current === "string") {
            if (current.length > 1_000) throw new Error("Setting value contains an oversized string.");
            return;
        }
        if (Array.isArray(current)) {
            if (current.length > 100) throw new Error("Setting value contains an oversized array.");
            current.forEach((item) => visit(item, depth + 1));
            return;
        }
        if (!isRecord(current)) throw new Error("Setting value contains an unsupported value.");
        for (const [key, nested] of Object.entries(current)) {
            if (
                key === "__proto__"
                || key === "constructor"
                || key === "prototype"
                || isSecretBearingSettingKey(key)
            ) {
                throw new Error("Setting value contains a forbidden field.");
            }
            visit(nested, depth + 1);
        }
    };
    visit(value, 0);
    const serialized = JSON.stringify(value);
    if (serialized.length > 8_000) throw new Error("Setting value is too large.");
    if (Object.keys(value).length > 50) throw new Error("Setting value has too many fields.");
    return value;
}

const SOCIAL_HOSTS = {
    instagram: ["instagram.com"],
    telegram: ["t.me", "telegram.me", "telegram.org"],
    whatsapp: ["wa.me", "whatsapp.com"],
    bale: ["ble.ir", "bale.ai"],
} as const;

function parseRootRelativeAsset(value: unknown, field: string, extensions: readonly string[]): string {
    if (typeof value !== "string" || value.length === 0 || value.length > 500) throw new Error(`${field} must be a safe media path.`);
    if (!value.startsWith("/") || value.startsWith("//") || value.includes("..") || value.includes("?") || value.includes("#")) {
        throw new Error(`${field} must be a safe media path.`);
    }
    const normalized = value.toLowerCase();
    if (!extensions.some((extension) => normalized.endsWith(extension))) throw new Error(`${field} has an unsupported file type.`);
    return value;
}

function parseOptionalHttpsUrl(value: unknown, field: string, hosts: readonly string[]): string {
    if (value === undefined || value === null || value === "") return "";
    if (typeof value !== "string" || value.length > 2_048) throw new Error(`${field} must be an HTTPS URL.`);
    let url: URL;
    try { url = new URL(value); } catch { throw new Error(`${field} must be an HTTPS URL.`); }
    if (url.protocol !== "https:" || !hosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
        throw new Error(`${field} must use an approved provider URL.`);
    }
    return url.toString();
}

export function parsePublicSettingValue(key: EditableSettingKey, value: Record<string, unknown>): Record<string, unknown> {
    if (key === "site.social") {
        const extra = Object.keys(value).filter((name) => !Object.hasOwn(SOCIAL_HOSTS, name));
        if (extra.length > 0) throw new Error("site.social contains an unsupported network.");
        return Object.fromEntries(Object.entries(SOCIAL_HOSTS).map(([name, hosts]) => [name, parseOptionalHttpsUrl(value[name], `site.social.${name}`, hosts)]));
    }
    if (key === "site.contact") {
        for (const language of ["en", "fa"]) {
            const localized = value[language];
            if (!isRecord(localized)) throw new Error(`site.contact.${language} is required.`);
            parseOptionalHttpsUrl(localized.mapUrl, `site.contact.${language}.mapUrl`, ["google.com", "googleusercontent.com"]);
        }
    }
    if (key === "site.heroMedia") {
        const extra = Object.keys(value).filter((name) => !["enabled", "videoUrl", "posterUrl"].includes(name));
        if (extra.length > 0 || typeof value.enabled !== "boolean") throw new Error("site.heroMedia is invalid.");
        return {
            enabled: value.enabled,
            videoUrl: parseRootRelativeAsset(value.videoUrl, "site.heroMedia.videoUrl", [".webm", ".mp4"]),
            posterUrl: parseRootRelativeAsset(value.posterUrl, "site.heroMedia.posterUrl", [".jpg", ".jpeg", ".png", ".webp"]),
        };
    }
    return value;
}

export function isPrivateEditableSettingKey(key: EditableSettingKey): boolean {
    return key === "ai.runtime";
}
