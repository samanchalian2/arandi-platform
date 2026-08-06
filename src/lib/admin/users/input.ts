import { normalizeEmail, normalizeIranianMobile } from "@/lib/auth";

import { MANAGEABLE_ROLE_KEYS, type ManageableRoleKey } from "./types";
export { MANAGEABLE_ROLE_KEYS, type ManageableRoleKey } from "./types";

export class UserInputError extends Error {}

export function parseDisplayName(value: unknown): string {
    if (typeof value !== "string") throw new UserInputError("Display name is required.");
    const displayName = value.trim();
    if (displayName.length < 2 || displayName.length > 100) {
        throw new UserInputError("Display name must be between 2 and 100 characters.");
    }
    return displayName;
}

export function parseOptionalEmail(value: unknown): string | null {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value !== "string") throw new UserInputError("Email is invalid.");
    try {
        return normalizeEmail(value);
    } catch {
        throw new UserInputError("Email is invalid.");
    }
}

export function parseOptionalPhone(value: unknown): string | null {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value !== "string") throw new UserInputError("Mobile number is invalid.");
    try {
        return normalizeIranianMobile(value);
    } catch {
        throw new UserInputError("Mobile number is invalid.");
    }
}

export function parseRoleKeys(value: unknown): ManageableRoleKey[] {
    if (!Array.isArray(value) || value.length === 0) {
        throw new UserInputError("At least one role is required.");
    }
    const roleKeys = Array.from(new Set(value));
    if (
        roleKeys.some((role) =>
            typeof role !== "string"
            || !MANAGEABLE_ROLE_KEYS.includes(role as ManageableRoleKey))
    ) {
        throw new UserInputError("One or more roles are invalid.");
    }
    return roleKeys as ManageableRoleKey[];
}

export function parseStatus(value: unknown): "active" | "suspended" {
    if (value !== "active" && value !== "suspended") {
        throw new UserInputError("Status must be active or suspended.");
    }
    return value;
}
