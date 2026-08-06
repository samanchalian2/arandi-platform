export const MANAGEABLE_ROLE_KEYS = [
    "SuperAdmin",
    "Admin",
    "Editor",
    "Translator",
    "Viewer",
    "Customer",
] as const;

export type ManageableRoleKey = typeof MANAGEABLE_ROLE_KEYS[number];
