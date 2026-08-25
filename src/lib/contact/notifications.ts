import { normalizeEmail } from "@/lib/auth/identifiers";
import { prisma } from "@/lib/prisma";

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null;
}

export async function getContactNotificationRecipient(): Promise<string> {
    const setting = await prisma.setting.findUnique({
        where: { key: "contact.notifications" },
        select: { isPublic: true, value: true },
    });
    const value = setting && !setting.isPublic ? asRecord(setting.value) : null;
    if (value && typeof value.recipient === "string") return normalizeEmail(value.recipient);
    return "info@arandi.io";
}
