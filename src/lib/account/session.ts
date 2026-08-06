import { cookies } from "next/headers";

import { AUTH_SESSION_COOKIE, readDatabaseSession } from "@/lib/auth";

export async function getAccountSession() {
    const cookieStore = await cookies();
    const session = await readDatabaseSession(
        cookieStore.get(AUTH_SESSION_COOKIE)?.value,
    );
    if (!session || !session.permissions.includes("account.read")) return null;
    return session;
}
