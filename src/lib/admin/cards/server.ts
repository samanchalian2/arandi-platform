import "server-only";

import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function requireCardRouteOwnership(identifier: string, sectionId: string, cardId?: string) {
    if (!UUID_PATTERN.test(sectionId) || (cardId !== undefined && !UUID_PATTERN.test(cardId))) {
        notFound();
    }

    const page = await prisma.page.findUnique({
        where: UUID_PATTERN.test(identifier) ? { id: identifier } : { slug: identifier },
        select: { id: true, slug: true },
    });
    if (!page) {
        notFound();
    }

    const section = await prisma.section.findFirst({
        where: { id: sectionId, pageId: page.id },
        select: { id: true, key: true },
    });
    if (!section) {
        notFound();
    }

    if (cardId !== undefined) {
        const card = await prisma.card.findFirst({
            where: { id: cardId, sectionId: section.id },
            select: { id: true },
        });
        if (!card) {
            notFound();
        }
    }

    return { page, section };
}
