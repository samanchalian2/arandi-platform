import { isRecord } from "./validation";

const SAFE_TOKEN_KEY = /^(?:--)?[a-z][a-z0-9-]{0,79}$/;
const UNSAFE_CSS_VALUE = /url\s*\(|[;{}<>]|expression\s*\(/i;

export function parseThemeSlug(value: unknown): string {
    if (typeof value !== "string" || !/^[a-z][a-z0-9-]{1,63}$/.test(value.trim())) {
        throw new Error("Theme slug must be a safe lowercase identifier.");
    }
    return value.trim();
}

export function parseThemeName(value: unknown): string {
    if (typeof value !== "string") throw new Error("Theme name is required.");
    const name = value.trim();
    if (name.length < 2 || name.length > 100) throw new Error("Theme name is invalid.");
    return name;
}

export function parseThemeTokenRecord(value: unknown, fieldName: string): Record<string, string> {
    if (!isRecord(value)) throw new Error(`${fieldName} must be an object.`);
    const entries = Object.entries(value);
    if (entries.length > 100) throw new Error(`${fieldName} has too many entries.`);
    const result: Record<string, string> = {};
    for (const [key, tokenValue] of entries) {
        if (!SAFE_TOKEN_KEY.test(key)) throw new Error(`${fieldName} contains an invalid token key.`);
        if (
            typeof tokenValue !== "string"
            || tokenValue.length > 200
            || UNSAFE_CSS_VALUE.test(tokenValue)
        ) {
            throw new Error(`${fieldName}.${key} contains an unsafe token value.`);
        }
        result[key] = tokenValue.trim();
    }
    return result;
}

export function parseComponentOverrides(value: unknown): Record<string, Record<string, string>> {
    if (!isRecord(value)) throw new Error("componentOverrides must be an object.");
    if (Object.keys(value).length > 50) throw new Error("componentOverrides has too many components.");
    const result: Record<string, Record<string, string>> = {};
    for (const [component, tokens] of Object.entries(value)) {
        if (!/^[a-z][a-z0-9-]{0,63}$/i.test(component)) {
            throw new Error("componentOverrides contains an invalid component key.");
        }
        result[component] = parseThemeTokenRecord(tokens, `componentOverrides.${component}`);
    }
    return result;
}
