import { isRecord } from "./validation";
import { scrollwiseSceneKeys } from "@/lib/scrollwise-copy";

export const EDITABLE_SETTING_KEYS = [
    "site.company",
    "site.social",
    "site.heroMedia",
    "site.scrollwiseScenes",
    "site.scrollwiseExperience",
    "site.scrollwiseCopy",
    "site.seo",
    "site.contact",
    "site.logo",
    "ai.runtime",
    "contact.notifications",
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

export function parseSettingValue(value: unknown, maximumSerializedLength = 8_000): Record<string, unknown> {
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
    if (serialized.length > maximumSerializedLength) throw new Error("Setting value is too large.");
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
    if (key === "contact.notifications") {
        const recipient = value.recipient;
        if (typeof recipient !== "string" || recipient.trim().length < 5 || recipient.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.trim())) {
            throw new Error("contact.notifications.recipient is invalid.");
        }
        return { recipient: recipient.trim().toLowerCase() };
    }
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
    if (key === "site.scrollwiseScenes") {
        const sceneKeys = scrollwiseSceneKeys;
        const extra = Object.keys(value).filter((name) => !sceneKeys.includes(name as typeof sceneKeys[number]));
        if (extra.length > 0) throw new Error("site.scrollwiseScenes contains an unsupported scene.");
        return Object.fromEntries(sceneKeys.map((sceneKey) => {
            const scene = value[sceneKey];
            if (!isRecord(scene)) throw new Error(`site.scrollwiseScenes.${sceneKey} is required.`);
            const fields = Object.keys(scene).filter((name) => !["desktopUrl", "mobileUrl"].includes(name));
            if (fields.length > 0) throw new Error(`site.scrollwiseScenes.${sceneKey} is invalid.`);
            return [sceneKey, {
                desktopUrl: parseRootRelativeAsset(scene.desktopUrl, `site.scrollwiseScenes.${sceneKey}.desktopUrl`, [".jpg", ".jpeg", ".png", ".webp", ".avif"]),
                mobileUrl: parseRootRelativeAsset(scene.mobileUrl, `site.scrollwiseScenes.${sceneKey}.mobileUrl`, [".jpg", ".jpeg", ".png", ".webp", ".avif"]),
            }];
        }));
    }
    if (key === "site.scrollwiseExperience") {
        const supported = ["motionPreset", "showMotionControl", "menuMode", "headingScale", "veilOpacity", "storyHeight", "interludeHeight"] as const;
        const extra = Object.keys(value).filter((name) => !supported.includes(name as typeof supported[number]));
        if (extra.length > 0) throw new Error("site.scrollwiseExperience contains an unsupported field.");
        if (!(["subtle", "balanced", "cinematic"] as const).includes(value.motionPreset as "subtle" | "balanced" | "cinematic")) {
            throw new Error("site.scrollwiseExperience.motionPreset is invalid.");
        }
        if (typeof value.showMotionControl !== "boolean") throw new Error("site.scrollwiseExperience.showMotionControl is invalid.");
        if (value.menuMode !== "narrative" && value.menuMode !== "classic") throw new Error("site.scrollwiseExperience.menuMode is invalid.");
        const numberInRange = (field: "headingScale" | "veilOpacity" | "storyHeight" | "interludeHeight", minimum: number, maximum: number, integer = false) => {
            const candidate = value[field];
            if (typeof candidate !== "number" || !Number.isFinite(candidate) || candidate < minimum || candidate > maximum || (integer && !Number.isInteger(candidate))) {
                throw new Error(`site.scrollwiseExperience.${field} is invalid.`);
            }
            return candidate;
        };
        return {
            motionPreset: value.motionPreset,
            showMotionControl: value.showMotionControl,
            menuMode: value.menuMode,
            headingScale: numberInRange("headingScale", 90, 115, true),
            veilOpacity: numberInRange("veilOpacity", 0.5, 0.98),
            storyHeight: numberInRange("storyHeight", 120, 220, true),
            interludeHeight: numberInRange("interludeHeight", 60, 140, true),
        };
    }
    if (key === "site.scrollwiseCopy") {
        const languages = ["en", "fa"] as const;
        const fields = ["title", "description", "interludeTitle", "interludeDescription", "bridge", "assistantPrompt"] as const;
        const extraLanguages = Object.keys(value).filter((name) => !languages.includes(name as typeof languages[number]));
        if (extraLanguages.length > 0) throw new Error("site.scrollwiseCopy contains an unsupported language.");
        const boundedText = (candidate: unknown, field: string, maximum: number) => {
            if (typeof candidate !== "string") throw new Error(`${field} must be text.`);
            const normalized = candidate.trim();
            if (normalized.length < 2 || normalized.length > maximum) throw new Error(`${field} must contain 2-${maximum} characters.`);
            return normalized;
        };
        return Object.fromEntries(languages.map((language) => {
            const localized = value[language];
            if (!isRecord(localized)) throw new Error(`site.scrollwiseCopy.${language} is required.`);
            const extraScenes = Object.keys(localized).filter((name) => !scrollwiseSceneKeys.includes(name as typeof scrollwiseSceneKeys[number]));
            if (extraScenes.length > 0) throw new Error(`site.scrollwiseCopy.${language} contains an unsupported scene.`);
            return [language, Object.fromEntries(scrollwiseSceneKeys.map((sceneKey) => {
                const scene = localized[sceneKey];
                if (!isRecord(scene)) throw new Error(`site.scrollwiseCopy.${language}.${sceneKey} is required.`);
                const extraFields = Object.keys(scene).filter((name) => !fields.includes(name as typeof fields[number]));
                if (extraFields.length > 0) throw new Error(`site.scrollwiseCopy.${language}.${sceneKey} contains an unsupported field.`);
                return [sceneKey, {
                    title: boundedText(scene.title, `site.scrollwiseCopy.${language}.${sceneKey}.title`, 160),
                    description: boundedText(scene.description, `site.scrollwiseCopy.${language}.${sceneKey}.description`, 600),
                    interludeTitle: boundedText(scene.interludeTitle, `site.scrollwiseCopy.${language}.${sceneKey}.interludeTitle`, 160),
                    interludeDescription: boundedText(scene.interludeDescription, `site.scrollwiseCopy.${language}.${sceneKey}.interludeDescription`, 600),
                    bridge: boundedText(scene.bridge, `site.scrollwiseCopy.${language}.${sceneKey}.bridge`, 300),
                    assistantPrompt: boundedText(scene.assistantPrompt, `site.scrollwiseCopy.${language}.${sceneKey}.assistantPrompt`, 240),
                }];
            }))];
        }));
    }
    return value;
}

export function isPrivateEditableSettingKey(key: EditableSettingKey): boolean {
    return key === "ai.runtime" || key === "site.scrollwiseScenes" || key === "site.scrollwiseExperience" || key === "site.scrollwiseCopy" || key === "contact.notifications";
}
