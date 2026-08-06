import { PrismaClient } from "@prisma/client";

import { normalizeEmail, normalizeIranianMobile } from "../src/lib/auth/identifiers";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

function required(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`${name} is required.`);
    return value;
}

async function main() {
    const displayName = required("BOOTSTRAP_ADMIN_NAME");
    const phoneE164 = normalizeIranianMobile(required("BOOTSTRAP_ADMIN_PHONE"));
    const emailValue = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim();
    const email = emailValue ? normalizeEmail(emailValue) : null;
    const passwordHash = await hashPassword(required("BOOTSTRAP_ADMIN_PASSWORD"));

    const superAdminRole = await prisma.role.findUniqueOrThrow({
        where: { key: "SuperAdmin" },
    });
    const existingSuperAdmin = await prisma.user.count({
        where: {
            roles: {
                some: { roleId: superAdminRole.id },
            },
        },
    });
    if (existingSuperAdmin > 0) {
        throw new Error("A SuperAdmin already exists; bootstrap is disabled.");
    }

    await prisma.user.create({
        data: {
            displayName,
            phoneE164,
            email,
            phoneVerifiedAt: new Date(),
            status: "active",
            credential: {
                create: { passwordHash },
            },
            roles: {
                create: { roleId: superAdminRole.id },
            },
            securityEvents: {
                create: {
                    eventType: "admin.bootstrap",
                    outcome: "success",
                    metadata: {},
                },
            },
        },
    });

    process.stdout.write("SuperAdmin bootstrap completed.\n");
}

main()
    .then(async () => prisma.$disconnect())
    .catch(async (error) => {
        console.error(error instanceof Error ? error.message : "Bootstrap failed.");
        await prisma.$disconnect();
        process.exit(1);
    });
