import {
    createHash,
    createHmac,
    randomBytes,
    randomInt,
    timingSafeEqual,
} from "node:crypto";

export const SESSION_TOKEN_BYTES = 32;
export const RECOVERY_TOKEN_BYTES = 32;
export const OTP_TTL_MINUTES = 5;
export const RECOVERY_TTL_MINUTES = 30;
export const SESSION_TTL_DAYS = 14;

export function createOpaqueToken(bytes = SESSION_TOKEN_BYTES): string {
    if (!Number.isInteger(bytes) || bytes < 16 || bytes > 128) {
        throw new Error("Token entropy must be between 16 and 128 bytes.");
    }
    return randomBytes(bytes).toString("base64url");
}

export function isPlausibleOpaqueToken(token: string | null | undefined, bytes = SESSION_TOKEN_BYTES): boolean {
    if (!token || !Number.isInteger(bytes) || bytes < 16 || bytes > 128) return false;
    const encodedLength = Math.ceil((bytes * 8) / 6);
    return token.length === encodedLength && /^[A-Za-z0-9_-]+$/.test(token);
}

export function hashOpaqueToken(token: string): string {
    return createHash("sha256").update(token, "utf8").digest("base64url");
}

export function createOtpCode(): string {
    return randomInt(100_000, 1_000_000).toString();
}

export function hashOtpCode(code: string, pepper: string): string {
    if (!/^\d{6}$/.test(code)) {
        throw new Error("OTP code must contain exactly six digits.");
    }
    if (pepper.length < 32) {
        throw new Error("OTP pepper must contain at least 32 characters.");
    }
    return createHmac("sha256", pepper).update(code, "utf8").digest("base64url");
}

export function hashSensitiveValue(value: string, pepper: string): string {
    if (!value || pepper.length < 32) {
        throw new Error("Sensitive value hashing requires a value and a 32-character pepper.");
    }
    return createHmac("sha256", pepper).update(value, "utf8").digest("base64url");
}

export function constantTimeHashMatches(expectedHash: string, actualHash: string): boolean {
    const expected = Buffer.from(expectedHash);
    const actual = Buffer.from(actualHash);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function expiresInMinutes(minutes: number, now = new Date()): Date {
    if (!Number.isFinite(minutes) || minutes <= 0) {
        throw new Error("Expiry minutes must be positive.");
    }
    return new Date(now.getTime() + minutes * 60_000);
}

export function expiresInDays(days: number, now = new Date()): Date {
    if (!Number.isFinite(days) || days <= 0) {
        throw new Error("Expiry days must be positive.");
    }
    return new Date(now.getTime() + days * 86_400_000);
}
