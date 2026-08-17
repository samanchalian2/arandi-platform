import assert from "node:assert/strict";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { NextRequest } from "next/server";
import sharp from "sharp";

import {
    getCardUpdateScopeError,
    isStaleCardUpdate,
    parseCardCreateInput,
    parseCardUpdateInput,
} from "../src/app/api/cms/_lib/card-input";
import { asError } from "../src/app/api/cms/_lib/http";
import {
    parseMediaCreateInput,
    parseMediaUpdateInput,
} from "../src/app/api/cms/_lib/media-input";
import {
    parseNavigationHref,
    parseNavigationKey,
    parseNavigationTranslations,
} from "../src/app/api/cms/_lib/navigation-input";
import {
    parseComponentOverrides,
    parseThemeSlug,
    parseThemeTokenRecord,
} from "../src/app/api/cms/_lib/theme-input";
import {
    isSecretBearingSettingKey,
    parseEditableSettingKey,
    parsePublicSettingValue,
    parseSettingValue,
} from "../src/app/api/cms/_lib/setting-input";
import { defaultScrollwiseCopy } from "../src/lib/scrollwise-copy";
import {
    parsePageCreateInput,
    parsePageRoute,
    parsePageSlug,
} from "../src/app/api/cms/_lib/page-create-input";
import {
    PAGE_TEMPLATES,
    PAGE_TEMPLATE_KEYS,
} from "../src/lib/admin/pages/templates";
import { mapCard } from "../src/app/api/cms/_lib/mappers";
import {
    assertCompleteOwnedCollection,
    parseReorderItems,
} from "../src/app/api/cms/_lib/reorder";
import {
    hasAnyRole,
    readPrincipal,
    requireAnyPermission,
    requirePermission,
} from "../src/app/api/cms/_lib/security";
import { parseUuid } from "../src/app/api/cms/_lib/validation";
import { GET as getCard, PUT as updateCard } from "../src/app/api/cms/cards/[id]/route";
import { validateCardDraft } from "../src/components/admin/AdminCardDetails";
import type { CardEditDraft } from "../src/components/admin/AdminCardEditForm";
import {
    fetchCardById,
    fetchCards,
    updateCardRequest,
} from "../src/lib/admin/cards/api";
import {
    applyOptimisticCardOrder,
    createCanonicalCardOrder,
    isCardReorderDisabled,
    moveCard,
} from "../src/lib/admin/cards/ordering";
import {
    getCardCapabilities,
    mapRawCard,
    parseCardJsonObject,
    type CardDetails,
    type RawCmsCard,
} from "../src/lib/admin/cards/types";
import {
    applyOptimisticSectionOrder,
    isSectionReorderAvailable,
    reorderIds,
} from "../src/lib/admin/sections/ordering";
import type { SectionListItem } from "../src/lib/admin/sections/types";
import { prisma } from "../src/lib/prisma";
import {
    removeStoredMediaFile,
    stageStoredMediaDeletion,
    storeImageUpload,
} from "../src/lib/media/storage";

const CARD_ID = "11111111-1111-4111-8111-111111111111";
const SECOND_CARD_ID = "22222222-2222-4222-8222-222222222222";
const SECTION_ID = "33333333-3333-4333-8333-333333333333";
const SECOND_SECTION_ID = "44444444-4444-4444-8444-444444444444";
const MEDIA_ID = "55555555-5555-4555-8555-555555555555";
const UPDATED_AT = new Date("2026-08-01T08:00:00.000Z");

const rawCmsCard: RawCmsCard = {
    id: CARD_ID,
    key: "service:test",
    sectionId: SECTION_ID,
    variant: "serviceCard",
    order: 1,
    publishState: "published",
    status: "published",
    image: null,
    tags: ["service"],
    metrics: {},
    payload: {},
    translation: {
        languageCode: "en",
        title: "Test card",
        subtitle: null,
        description: null,
        statusBadge: null,
        ctaLabel: null,
        ctaHref: null,
    },
    translations: [
        {
            languageCode: "en",
            title: "Test card",
            subtitle: null,
            description: null,
            statusBadge: null,
            ctaLabel: null,
            ctaHref: null,
        },
        {
            languageCode: "fa",
            title: "کارت آزمایشی",
            subtitle: null,
            description: null,
            statusBadge: null,
            ctaLabel: null,
            ctaHref: null,
        },
    ],
    createdAt: "2026-08-01T07:00:00.000Z",
    updatedAt: UPDATED_AT.toISOString(),
};

function details(id = CARD_ID, order = 1): CardDetails {
    return {
        ...mapRawCard({ ...rawCmsCard, id, order, key: `card:${id}` }),
        id,
        order,
    };
}

function editDraft(card: CardDetails): CardEditDraft {
    return {
        key: card.key,
        variant: card.variant,
        publishState: card.publishState,
        order: String(card.order),
        mediaId: card.media?.id ?? "",
        tags: card.tags.join(", "),
        metrics: JSON.stringify(card.metrics),
        payload: JSON.stringify(card.payload),
        translations: structuredClone(card.translations),
    };
}

function request(
    role?: "SuperAdmin" | "Admin" | "Editor" | "Translator" | "Viewer",
    init?: ConstructorParameters<typeof NextRequest>[1],
): NextRequest {
    const headers = new Headers(init?.headers);
    if (role) {
        headers.set("cookie", `admin_mock_role=${role}`);
    }

    return new NextRequest("http://localhost/api/cms/cards", {
        ...init,
        headers,
    });
}

function enableDevelopmentMockAuth(): void {
    Reflect.set(process.env, "NODE_ENV", "test");
    process.env.CMS_ENABLE_DEV_MOCK_AUTH = "true";
}

const cardRecord = {
    id: CARD_ID,
    createdAt: new Date("2026-08-01T07:00:00.000Z"),
    updatedAt: UPDATED_AT,
    sectionId: SECTION_ID,
    key: "service:test",
    variant: "serviceCard",
    order: 1,
    publishState: "published",
    tags: ["service"],
    metrics: {},
    payload: {},
    mediaId: MEDIA_ID,
    translations: [{
        id: "66666666-6666-4666-8666-666666666666",
        createdAt: new Date("2026-08-01T07:00:00.000Z"),
        updatedAt: UPDATED_AT,
        cardId: CARD_ID,
        languageCode: "en",
        title: "Test card",
        subtitle: null,
        description: "Description",
        statusBadge: null,
        ctaLabel: null,
        ctaHref: null,
    }],
    media: {
        id: MEDIA_ID,
        createdAt: new Date("2026-08-01T07:00:00.000Z"),
        updatedAt: UPDATED_AT,
        title: "Image",
        alt: "Alt",
        caption: null,
        url: "/test.png",
        type: "image/png",
        width: 100,
        height: 100,
        metadata: {},
    },
} satisfies Parameters<typeof mapCard>[0];

test("production anonymous and spoofed role headers are unauthorized", { concurrency: false }, async () => {
    Reflect.set(process.env, "NODE_ENV", "production");
    process.env.CMS_ENABLE_DEV_MOCK_AUTH = "true";

    const anonymous = request();
    const anonymousResult = await requirePermission(anonymous, "card.read");
    assert.equal(anonymousResult?.status, 401);
    assert.equal((await anonymousResult?.json()).error.code, "UNAUTHORIZED");

    const spoofed = request(undefined, {
        headers: {
            "x-cms-roles": "super_admin",
            "x-cms-user-id": "spoofed",
        },
    });
    assert.equal((await requirePermission(spoofed, "card.delete"))?.status, 401);
    assert.equal(await readPrincipal(spoofed), null);
});

test("Viewer writes are forbidden and Translator gets translation-only Card scope", { concurrency: false }, async () => {
    enableDevelopmentMockAuth();

    assert.equal((await requirePermission(request("Viewer"), "card.write"))?.status, 403);
    assert.equal(await requireAnyPermission(request("Translator"), ["card.write", "card.translate"]), null);

    const structural = parseCardUpdateInput({ key: "changed" });
    assert.equal(
        getCardUpdateScopeError(true, structural),
        "Translator role can only update Card translation fields.",
    );

    const translationOnly = parseCardUpdateInput({
        translations: {
            en: { title: "Translated" },
        },
    });
    assert.equal(getCardUpdateScopeError(true, translationOnly), null);
});

test("Section reorder role policy allows Editor and rejects Translator", { concurrency: false }, async () => {
    enableDevelopmentMockAuth();

    const editor = request("Editor");
    assert.equal(await requirePermission(editor, "section.write"), null);
    assert.equal(hasAnyRole(await readPrincipal(editor), ["super_admin", "cms_admin", "editor"]), true);

    const translator = request("Translator");
    assert.equal(await requirePermission(translator, "section.write"), null);
    assert.equal(hasAnyRole(await readPrincipal(translator), ["super_admin", "cms_admin", "editor"]), false);
});

test("filtered Section lists cannot reorder and canonical keyboard moves keep the full collection", () => {
    assert.equal(isSectionReorderAvailable(true, "hero", "all"), false);
    assert.equal(isSectionReorderAvailable(true, "", "enabled"), false);
    assert.equal(isSectionReorderAvailable(true, "", "all"), true);
    assert.deepEqual(
        reorderIds([CARD_ID, SECOND_CARD_ID, SECTION_ID], SECTION_ID, CARD_ID),
        [SECTION_ID, CARD_ID, SECOND_CARD_ID],
    );
});

test("reorder validation rejects partial, duplicate, cross-owner, and invalid order inputs", () => {
    assert.throws(
        () => parseReorderItems([{ id: CARD_ID, order: 1 }, { id: CARD_ID, order: 2 }]),
        /Duplicate item id/,
    );
    assert.throws(
        () => parseReorderItems([{ id: CARD_ID, order: 1 }, { id: SECOND_CARD_ID, order: 1 }]),
        /Duplicate order/,
    );
    assert.throws(
        () => parseReorderItems([{ id: CARD_ID, order: -1 }]),
        /non-negative integer/,
    );
    assert.throws(
        () => parseReorderItems([{ id: CARD_ID, order: 2 }]),
        /contiguous sequence/,
    );

    const items = parseReorderItems([{ id: CARD_ID, order: 1 }]);
    assert.throws(
        () => assertCompleteOwnedCollection(items, [
            { id: CARD_ID, ownerId: SECTION_ID },
            { id: SECOND_CARD_ID, ownerId: SECTION_ID },
        ], SECTION_ID, "Card"),
        /complete Card collection/,
    );
    assert.match(
        asError(new Error("A complete Card collection is required for reorder.")).message,
        /complete Card collection/,
    );
    assert.throws(
        () => assertCompleteOwnedCollection(items, [{ id: CARD_ID, ownerId: SECOND_SECTION_ID }], SECTION_ID, "Card"),
        /supplied owner/,
    );
    assert.throws(
        () => assertCompleteOwnedCollection(items, [{ id: CARD_ID, ownerId: SECOND_SECTION_ID }], SECTION_ID, "Section"),
        /supplied owner/,
    );
});

test("Card detail mapper includes translations, publish state, and current media", () => {
    const mapped = mapCard(cardRecord, "en", true);
    assert.equal(mapped.id, CARD_ID);
    assert.equal(mapped.publishState, "published");
    assert.equal(mapped.translation?.title, "Test card");
    assert.equal(mapped.image?.id, MEDIA_ID);
    assert.equal(mapped.translations?.length, 1);
});

test("Card detail route validates UUID and returns 404 for an absent Card", { concurrency: false }, async () => {
    enableDevelopmentMockAuth();

    const invalidResponse = await getCard(
        request("Viewer"),
        { params: Promise.resolve({ id: "not-a-uuid" }) },
    );
    assert.equal(invalidResponse.status, 400);

    const originalFindUnique = prisma.card.findUnique;
    Reflect.set(prisma.card, "findUnique", async () => null);
    try {
        const missingResponse = await getCard(
            request("Viewer"),
            { params: Promise.resolve({ id: CARD_ID }) },
        );
        assert.equal(missingResponse.status, 404);
        assert.equal((await missingResponse.json()).error.code, "NOT_FOUND");
    } finally {
        Reflect.set(prisma.card, "findUnique", originalFindUnique);
    }
});

test("Card update validation rejects invalid references and supports explicit media detach", { concurrency: false }, async () => {
    enableDevelopmentMockAuth();

    assert.equal(parseCardUpdateInput({ mediaId: null }).mediaId, null);
    assert.throws(() => parseCardUpdateInput({ mediaId: "bad" }), /valid UUID/);
    assert.throws(() => parseCardUpdateInput({ sectionId: "bad" }), /valid UUID/);

    const originalTransaction = prisma.$transaction;
    Reflect.set(prisma, "$transaction", async (callback: (tx: object) => Promise<unknown>) => callback({
        card: {
            findUnique: async () => ({ id: CARD_ID, updatedAt: UPDATED_AT }),
        },
        section: {
            findUnique: async () => null,
        },
    }));

    try {
        const response = await updateCard(
            request("Editor", {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ sectionId: SECOND_SECTION_ID }),
            }),
            { params: Promise.resolve({ id: CARD_ID }) },
        );
        assert.equal(response.status, 400);
        assert.equal((await response.json()).error.code, "BAD_REQUEST");
    } finally {
        Reflect.set(prisma, "$transaction", originalTransaction);
    }
});

test("stale expectedUpdatedAt values are detected", () => {
    assert.equal(isStaleCardUpdate(UPDATED_AT, new Date(UPDATED_AT)), false);
    assert.equal(isStaleCardUpdate(UPDATED_AT, new Date("2026-08-01T08:00:01.000Z")), true);
});

test("optimistic Section reorder preserves an exact rollback snapshot", () => {
    const previous: SectionListItem[] = [
        {
            id: CARD_ID,
            pageId: SECTION_ID,
            key: "one",
            type: "cards",
            order: 1,
            enabled: true,
            status: "enabled",
            languages: ["en"],
            title: "One",
            subtitle: "",
            updatedAt: UPDATED_AT.toISOString(),
        },
        {
            id: SECOND_CARD_ID,
            pageId: SECTION_ID,
            key: "two",
            type: "cards",
            order: 2,
            enabled: true,
            status: "enabled",
            languages: ["en"],
            title: "Two",
            subtitle: "",
            updatedAt: UPDATED_AT.toISOString(),
        },
    ];
    const rollbackSnapshot = structuredClone(previous);
    const optimistic = applyOptimisticSectionOrder(previous, [
        { id: SECOND_CARD_ID, order: 1 },
        { id: CARD_ID, order: 2 },
    ]);

    assert.deepEqual(optimistic.map((item) => item.id), [SECOND_CARD_ID, CARD_ID]);
    assert.deepEqual(previous, rollbackSnapshot);
    assert.deepEqual(rollbackSnapshot.map((item) => item.id), [CARD_ID, SECOND_CARD_ID]);
});

test("UUID parser accepts canonical UUIDs and rejects malformed Card ids", () => {
    assert.equal(parseUuid(CARD_ID, "id"), CARD_ID);
    assert.throws(() => parseUuid("invalid", "id"), /valid UUID/);
});

test("Card admin API list query is scoped to the supplied Section and detail maps successfully", { concurrency: false }, async () => {
    const originalFetch = globalThis.fetch;
    const calls: string[] = [];
    globalThis.fetch = async (input) => {
        calls.push(String(input));
        return Response.json({ ok: true, data: String(input).includes(`/cards/${CARD_ID}`) ? rawCmsCard : [rawCmsCard] });
    };

    try {
        const list = await fetchCards(SECTION_ID, "en");
        const detail = await fetchCardById(CARD_ID, "en");
        assert.equal(list.length, 1);
        assert.equal(detail.id, CARD_ID);
        assert.match(calls[0], new RegExp(`sectionId=${SECTION_ID}`));
        assert.match(calls[0], /ordering=asc/);
        assert.match(calls[1], new RegExp(`/cards/${CARD_ID}`));
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("Card UI capabilities mirror Viewer, Translator, Editor, and Admin RBAC", () => {
    assert.deepEqual(getCardCapabilities("Viewer"), {
        canEditStructure: false,
        canEditTranslations: false,
        canReorder: false,
        canDelete: false,
    });
    assert.deepEqual(getCardCapabilities("Translator"), {
        canEditStructure: false,
        canEditTranslations: true,
        canReorder: false,
        canDelete: false,
    });
    assert.deepEqual(getCardCapabilities("Editor"), {
        canEditStructure: true,
        canEditTranslations: true,
        canReorder: true,
        canDelete: false,
    });
    assert.equal(getCardCapabilities("Admin").canDelete, true);
    assert.equal(getCardCapabilities("SuperAdmin").canDelete, true);
});

test("Card update client preserves explicit media detach and independent translation payloads", { concurrency: false }, async () => {
    const originalFetch = globalThis.fetch;
    const bodies: Array<Record<string, unknown>> = [];
    globalThis.fetch = async (_input, init) => {
        bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
        return Response.json({ ok: true, data: rawCmsCard });
    };

    try {
        await updateCardRequest({
            id: CARD_ID,
            sectionId: SECTION_ID,
            lang: "en",
            expectedUpdatedAt: UPDATED_AT.toISOString(),
            mediaId: null,
            translations: {
                en: {
                    title: "Updated EN",
                    subtitle: "",
                    description: "",
                    statusBadge: "",
                    ctaLabel: "",
                    ctaHref: "",
                },
            },
        });
        await updateCardRequest({
            id: CARD_ID,
            sectionId: SECTION_ID,
            lang: "fa",
            expectedUpdatedAt: UPDATED_AT.toISOString(),
            translations: {
                fa: {
                    title: "فارسی جدید",
                    subtitle: "",
                    description: "",
                    statusBadge: "",
                    ctaLabel: "",
                    ctaHref: "",
                },
            },
        });

        assert.equal(bodies[0].mediaId, null);
        assert.deepEqual(Object.keys(bodies[0].translations as object), ["en"]);
        assert.deepEqual(Object.keys(bodies[1].translations as object), ["fa"]);
        assert.equal(bodies[0].expectedUpdatedAt, UPDATED_AT.toISOString());
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("Card JSON validation blocks malformed or non-object values before save", () => {
    assert.deepEqual(parseCardJsonObject('{"value":1}', "Payload"), { value: 1 });
    assert.throws(() => parseCardJsonObject("{", "Payload"), /valid JSON/);
    assert.throws(() => parseCardJsonObject("[]", "Payload"), /JSON object/);

    const card = details();
    const baseline = editDraft(card);
    const draft = { ...structuredClone(baseline), payload: "{" };
    const result = validateCardDraft(draft, baseline, true);
    assert.match(result.errors.payload, /valid JSON/);
});

test("Card draft validation permits Translator translation changes but detects structural JSON errors", () => {
    const card = details();
    const baseline = editDraft(card);
    const translatorDraft = structuredClone(baseline);
    translatorDraft.translations.fa.title = "ترجمه تازه";
    assert.deepEqual(validateCardDraft(translatorDraft, baseline, false).errors, {});

    const structuralDraft = { ...structuredClone(baseline), metrics: "[]" };
    assert.match(validateCardDraft(structuralDraft, baseline, true).errors.metrics, /JSON object/);
});

test("Card reorder is complete, contiguous, filter-safe, keyboard-accessible, and rollback-safe", () => {
    const previous = [details(CARD_ID, 1), details(SECOND_CARD_ID, 2)];
    const rollback = structuredClone(previous);
    const moved = moveCard(previous, SECOND_CARD_ID, -1);
    const payload = createCanonicalCardOrder(moved);
    const optimistic = applyOptimisticCardOrder(previous, payload);

    assert.deepEqual(payload, [
        { id: SECOND_CARD_ID, order: 1 },
        { id: CARD_ID, order: 2 },
    ]);
    assert.equal(payload.length, previous.length);
    assert.deepEqual(optimistic.map((card) => card.id), [SECOND_CARD_ID, CARD_ID]);
    assert.deepEqual(previous, rollback);
    assert.equal(isCardReorderDisabled("query", false), true);
    assert.equal(isCardReorderDisabled("", true), true);
    assert.equal(isCardReorderDisabled("", false), false);
});

test("Card create validation enforces safe structure, references, and translations", () => {
    const input = parseCardCreateInput({
        key: "service:new",
        sectionId: SECTION_ID,
        mediaId: MEDIA_ID,
        order: 1,
        tags: ["service"],
        metrics: {},
        payload: {},
        translations: { en: { title: "New Card" } },
    });
    assert.equal(input.sectionId, SECTION_ID);
    assert.equal(input.mediaId, MEDIA_ID);
    assert.equal(input.translations.en?.title, "New Card");

    assert.throws(
        () => parseCardCreateInput({ key: "bad", translations: { en: { title: "" } } }),
        /non-empty string/,
    );
    assert.throws(
        () => parseCardCreateInput({ key: "bad", order: -1, translations: { en: { title: "Title" } } }),
        /non-negative integer/,
    );
});

test("Media input accepts safe relative/https references and nullable metadata fields", () => {
    const created = parseMediaCreateInput({
        title: "Hero",
        url: "/media/hero.webp",
        type: "image/webp",
        width: 1600,
        height: 900,
        metadata: { source: "approved-library" },
    });
    assert.equal(created.url, "/media/hero.webp");
    assert.equal(created.type, "image/webp");

    const updated = parseMediaUpdateInput({
        alt: null,
        caption: "",
        width: null,
        expectedUpdatedAt: UPDATED_AT.toISOString(),
    });
    assert.equal(updated.alt, null);
    assert.equal(updated.caption, null);
    assert.equal(updated.width, null);
    assert.equal(updated.expectedUpdatedAt?.toISOString(), UPDATED_AT.toISOString());
});

test("Media input rejects unsafe protocols, credentials, invalid MIME types, and dimensions", () => {
    assert.throws(
        () => parseMediaCreateInput({ title: "Bad", url: "javascript:alert(1)", type: "image/png" }),
        /http or https/,
    );
    assert.throws(
        () => parseMediaCreateInput({ title: "Bad", url: "https://user:pass@example.com/a.png", type: "image/png" }),
        /credentials/,
    );
    assert.throws(
        () => parseMediaCreateInput({ title: "Bad", url: "/a", type: "not-a-mime" }),
        /valid MIME/,
    );
    assert.throws(
        () => parseMediaCreateInput({ title: "Bad", url: "/a", type: "image/png", width: -1 }),
        /positive integer/,
    );
    assert.throws(
        () => parseMediaUpdateInput({ metadata: [] }),
        /JSON object/,
    );
});

test("Media filesystem storage validates bytes, sanitises images, and supports staged deletion", async () => {
    const previousRoot = process.env.MEDIA_STORAGE_ROOT;
    const previousBase = process.env.MEDIA_PUBLIC_BASE_URL;
    const root = await mkdtemp(path.join(tmpdir(), "arandi-media-"));
    process.env.MEDIA_STORAGE_ROOT = root;
    process.env.MEDIA_PUBLIC_BASE_URL = "/media";

    try {
        const png = await sharp({
            create: {
                width: 1,
                height: 1,
                channels: 4,
                background: { r: 0, g: 120, b: 255, alpha: 1 },
            },
        }).png().toBuffer();
        const stored = await storeImageUpload(
            new File([Uint8Array.from(png)], "../unsafe name.png", { type: "text/plain" }),
        );
        assert.equal(stored.mimeType, "image/png");
        assert.equal(stored.width, 1);
        assert.equal(stored.height, 1);
        assert.match(stored.url, /^\/media\/[0-9a-f-]+\.png$/);
        assert.equal(stored.originalName, "unsafe name.png");

        const storedPath = path.join(root, path.basename(stored.url));
        await access(storedPath);
        const staged = await stageStoredMediaDeletion(stored.url);
        assert.ok(staged);
        await assert.rejects(access(storedPath));
        await staged.rollback();
        await access(storedPath);
        await removeStoredMediaFile(stored.url);
        await assert.rejects(access(storedPath));

        await assert.rejects(
            storeImageUpload(new File(["<svg></svg>"], "bad.svg", { type: "image/png" })),
            /Only JPEG, PNG, and WebP/,
        );
    } finally {
        if (previousRoot === undefined) delete process.env.MEDIA_STORAGE_ROOT;
        else process.env.MEDIA_STORAGE_ROOT = previousRoot;
        if (previousBase === undefined) delete process.env.MEDIA_PUBLIC_BASE_URL;
        else process.env.MEDIA_PUBLIC_BASE_URL = previousBase;
        await rm(root, { recursive: true, force: true });
    }
});

test("Navigation input enforces safe keys, destinations, and bilingual labels", () => {
    assert.equal(parseNavigationKey("services_main"), "services_main");
    assert.equal(parseNavigationHref("/services?topic=ai", false), "/services?topic=ai");
    assert.equal(
        parseNavigationHref("https://example.com/path", true),
        "https://example.com/path",
    );
    assert.deepEqual(
        parseNavigationTranslations({
            en: { label: "Services" },
            fa: { label: "خدمات" },
        }, true),
        { en: "Services", fa: "خدمات" },
    );
    assert.throws(() => parseNavigationKey("../unsafe"), /safe lowercase/);
    assert.throws(() => parseNavigationHref("//evil.example", false), /root-relative/);
    assert.throws(() => parseNavigationHref("http://example.com", true), /HTTPS/);
    assert.throws(
        () => parseNavigationTranslations({ en: { label: "Only English" } }, true),
        /fa navigation label/,
    );
});

test("Theme token input blocks active CSS constructs and malformed keys", () => {
    assert.equal(parseThemeSlug("enterprise-default"), "enterprise-default");
    assert.deepEqual(
        parseThemeTokenRecord({ "--primary": "var(--brand-primary)", accent: "#135fad" }, "colors"),
        { "--primary": "var(--brand-primary)", accent: "#135fad" },
    );
    assert.deepEqual(
        parseComponentOverrides({ Button: { radius: "0.75rem" } }),
        { Button: { radius: "0.75rem" } },
    );
    assert.throws(() => parseThemeTokenRecord({ accent: "url(https://evil.example)" }, "colors"), /unsafe/);
    assert.throws(() => parseThemeTokenRecord({ "bad key": "#fff" }, "colors"), /invalid token key/);
});

test("Settings allowlist rejects secret-bearing keys and nested secret fields", () => {
    assert.equal(parseEditableSettingKey("site.company"), "site.company");
    assert.equal(isSecretBearingSettingKey("smtp.password"), true);
    assert.deepEqual(parseSettingValue({ name: "Arandi", links: ["one", "two"] }), {
        name: "Arandi",
        links: ["one", "two"],
    });
    assert.throws(() => parseEditableSettingKey("site.smtp"), /not editable/);
    assert.throws(() => parseSettingValue({ apiKey: "never" }), /forbidden field/);
    assert.throws(() => parseSettingValue({ nested: { password: "never" } }), /forbidden field/);
});

test("Scrollwise scene settings accept only the fixed local image map", () => {
    const value = Object.fromEntries([
        "gateway", "discover", "design", "buildSecure", "oilGas", "petrochemical", "connectedOperations", "intelligence", "outcomes", "finale",
    ].map((key, index) => [key, {
        desktopUrl: `/media-generated/scrollwise/0${index + 1}-scene-desktop.webp`,
        mobileUrl: `/media-generated/scrollwise/0${index + 1}-scene-mobile.webp`,
    }]));
    assert.deepEqual(parsePublicSettingValue("site.scrollwiseScenes", value), value);
    assert.throws(
        () => parsePublicSettingValue("site.scrollwiseScenes", { ...value, extra: value.gateway }),
        /unsupported scene/,
    );
    assert.throws(
        () => parsePublicSettingValue("site.scrollwiseScenes", {
            ...value,
            gateway: { desktopUrl: "https://evil.example/scene.webp", mobileUrl: value.gateway.mobileUrl },
        }),
        /safe media path/,
    );
    assert.throws(
        () => parsePublicSettingValue("site.scrollwiseScenes", {
            ...value,
            gateway: { desktopUrl: value.gateway.desktopUrl, mobileUrl: "/media/generated/script.svg" },
        }),
        /unsupported file type/,
    );
});

test("Scrollwise experience settings are bounded and reject arbitrary fields", () => {
    const value = { motionPreset: "cinematic", headingScale: 100, veilOpacity: 0.94, storyHeight: 150, interludeHeight: 90 };
    assert.deepEqual(parsePublicSettingValue("site.scrollwiseExperience", value), value);
    assert.throws(
        () => parsePublicSettingValue("site.scrollwiseExperience", { ...value, motionPreset: "extreme" }),
        /motionPreset is invalid/,
    );
    assert.throws(
        () => parsePublicSettingValue("site.scrollwiseExperience", { ...value, veilOpacity: 1 }),
        /veilOpacity is invalid/,
    );
    assert.throws(
        () => parsePublicSettingValue("site.scrollwiseExperience", { ...value, headingScale: 80 }),
        /headingScale is invalid/,
    );
    assert.throws(
        () => parsePublicSettingValue("site.scrollwiseExperience", { ...value, script: "alert(1)" }),
        /unsupported field/,
    );
});

test("Scrollwise bilingual card copy is complete, bounded, and rejects arbitrary structure", () => {
    assert.deepEqual(parsePublicSettingValue("site.scrollwiseCopy", defaultScrollwiseCopy), defaultScrollwiseCopy);
    assert.throws(
        () => parsePublicSettingValue("site.scrollwiseCopy", { ...defaultScrollwiseCopy, de: defaultScrollwiseCopy.en }),
        /unsupported language/,
    );
    assert.throws(
        () => parsePublicSettingValue("site.scrollwiseCopy", {
            ...defaultScrollwiseCopy,
            en: { ...defaultScrollwiseCopy.en, gateway: { ...defaultScrollwiseCopy.en.gateway, title: "" } },
        }),
        /must contain 2-160 characters/,
    );
    assert.throws(
        () => parsePublicSettingValue("site.scrollwiseCopy", {
            ...defaultScrollwiseCopy,
            fa: { ...defaultScrollwiseCopy.fa, gateway: { ...defaultScrollwiseCopy.fa.gateway, script: "never" } },
        }),
        /unsupported field/,
    );
});

test("Scrollwise ships ten governed v2 panoramic and mobile scene pairs plus four proof vignettes", async () => {
    const filenames = [
        "v2-01-gateway",
        "v2-02-discover",
        "v2-03-design",
        "v2-04-build-secure",
        "v2-05-oil-gas",
        "v2-06-petrochemical",
        "v2-07-connected-operations",
        "v2-08-intelligence",
        "v2-09-outcomes",
        "v2-10-finale",
    ];
    for (const filename of filenames) {
        const desktop = await sharp(path.join(process.cwd(), "public", "media-generated", "scrollwise", `${filename}-desktop.webp`)).metadata();
        const mobile = await sharp(path.join(process.cwd(), "public", "media-generated", "scrollwise", `${filename}-mobile.webp`)).metadata();
        assert.deepEqual({ format: desktop.format, width: desktop.width, height: desktop.height }, { format: "webp", width: 3200, height: 900 });
        assert.deepEqual({ format: mobile.format, width: mobile.width, height: mobile.height }, { format: "webp", width: 900, height: 1200 });
    }
    for (const filename of ["v2-proof-bid-boland", "v2-proof-sonqor", "v2-proof-negin-zafar", "v2-proof-noorin-bonyad"]) {
        const proof = await sharp(path.join(process.cwd(), "public", "media-generated", "scrollwise", `${filename}.webp`)).metadata();
        assert.deepEqual({ format: proof.format, width: proof.width, height: proof.height }, { format: "webp", width: 1600, height: 1000 });
    }
});

test("Page creation catalog is allowlisted, bilingual, and Draft-only", () => {
    assert.deepEqual(PAGE_TEMPLATES.map(({ key }) => key), [...PAGE_TEMPLATE_KEYS]);
    for (const template of PAGE_TEMPLATES) {
        assert.equal(new Set(template.sections.map(({ key }) => key)).size, template.sections.length);
    }
    const input = parsePageCreateInput({
        slug: "enterprise-ai",
        route: "/services/enterprise-ai",
        template: "service",
        status: "draft",
        seoKeywords: ["AI", "enterprise", "AI"],
        translations: {
            en: {
                title: "Enterprise AI",
                seoTitle: "Enterprise AI services",
                seoDescription: "A sufficiently detailed English description for the service.",
            },
            fa: {
                title: "هوش مصنوعی سازمانی",
                seoTitle: "خدمات هوش مصنوعی سازمانی",
                seoDescription: "توضیح کامل و معتبر فارسی برای صفحه خدمات سازمانی.",
            },
        },
    });
    assert.equal(input.template, "service");
    assert.deepEqual(input.seoKeywords, ["AI", "enterprise"]);
    assert.equal(parsePageSlug("valid-page"), "valid-page");
    assert.equal(parsePageRoute("/legal/privacy"), "/legal/privacy");
    assert.throws(() => parsePageSlug("../unsafe"), /safe lowercase/);
    assert.throws(() => parsePageRoute("//unsafe"), /canonical/);
    assert.throws(() => parsePageCreateInput({
        ...input,
        status: "published",
    } as unknown as Record<string, unknown>), /must start as draft/);
    assert.throws(() => parsePageCreateInput({
        slug: "missing-fa",
        route: "/missing-fa",
        template: "article",
        translations: { en: input.translations.en },
    }), /translations.fa/);
});
