import { isRecord } from "./validation";

export const EDITABLE_SETTING_KEYS = [
    "theme.default",
    "site.company",
    "site.social",
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

export function isPrivateEditableSettingKey(key: EditableSettingKey): boolean {
    return key === "ai.runtime";
}
