export const ADMIN_ROLES = ["SuperAdmin", "Admin", "Editor", "Translator", "Viewer"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminSession = {
    userId: string;
    displayName: string;
    roles: AdminRole[];
    isMock: true;
};

export const ADMIN_SESSION_COOKIE = "admin_mock_role";
