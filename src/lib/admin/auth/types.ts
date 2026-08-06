export const ADMIN_ROLES = ["SuperAdmin", "Admin", "Editor", "Translator", "Viewer"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminSession = {
    userId: string;
    displayName: string;
    roles: AdminRole[];
    isMock: boolean;
};

export const ADMIN_SESSION_COOKIE = "admin_mock_role";
export const DEV_MOCK_AUTH_FLAG = "CMS_ENABLE_DEV_MOCK_AUTH";

export function isDevelopmentMockAuthEnabled(
    env: { NODE_ENV?: string; CMS_ENABLE_DEV_MOCK_AUTH?: string } = process.env,
): boolean {
    return env.NODE_ENV !== "production" && env.CMS_ENABLE_DEV_MOCK_AUTH === "true";
}
