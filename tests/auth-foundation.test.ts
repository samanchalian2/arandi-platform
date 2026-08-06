import assert from "node:assert/strict";
import test from "node:test";

import {
    createOpaqueToken,
    createOtpCode,
    expiresInDays,
    expiresInMinutes,
    hashOpaqueToken,
    hashOtpCode,
    isPlausibleOpaqueToken,
    normalizeEmail,
    normalizeIranianMobile,
    requireAuthPepper,
    validatePassword,
    verifyCsrfToken,
    verifyPassword,
    hashPassword,
} from "../src/lib/auth";
import {
    EmailGatewayUnavailableError,
    getEmailGateway,
} from "../src/integrations/email/gateway";
import {
    getSmsGateway,
    SmsGatewayUnavailableError,
} from "../src/integrations/sms/gateway";
import { POST as passwordLoginRoute } from "../src/app/api/auth/password/route";
import { POST as logoutRoute } from "../src/app/api/auth/logout/route";
import { NextRequest } from "next/server";
import {
    readBoundedJson,
    RequestBodyTooLargeError,
} from "../src/lib/http/boundedJson";
import {
    parseDisplayName,
    parseOptionalEmail,
    parseOptionalPhone,
    parseRoleKeys,
    parseStatus,
    UserInputError,
} from "../src/lib/admin/users/input";
import {
    ContactValidationError,
    parseContactSubmissionInput,
} from "../src/lib/contact";

import {
    AdminIdentityForbiddenError,
    requireAdminIdentityPermission,
} from "../src/app/api/admin/_lib/security";

test("bounded JSON reading enforces media type and streamed byte limits", async () => {
    const valid = new Request("https://arandi.test/api", {
        method: "POST",
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify({ ok: true }),
    });
    assert.deepEqual(await readBoundedJson(valid, 64), { ok: true });

    const oversized = new Request("https://arandi.test/api", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value: "x".repeat(64) }),
    });
    await assert.rejects(
        readBoundedJson(oversized, 32),
        RequestBodyTooLargeError,
    );

    const wrongType = new Request("https://arandi.test/api", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "{}",
    });
    await assert.rejects(readBoundedJson(wrongType, 32), TypeError);
});

test("Iranian mobile normalization produces one canonical E.164 value", () => {
    const expected = "+989123456789";
    assert.equal(normalizeIranianMobile("0912 345 6789"), expected);
    assert.equal(normalizeIranianMobile("+98 (912) 345-6789"), expected);
    assert.equal(normalizeIranianMobile("00989123456789"), expected);
    assert.equal(normalizeIranianMobile("989123456789"), expected);
    assert.throws(() => normalizeIranianMobile("02112345678"), /valid Iranian mobile/);
    assert.throws(() => normalizeIranianMobile("0912345678"), /valid Iranian mobile/);
});

test("Email normalization is bounded and rejects malformed values", () => {
    assert.equal(normalizeEmail(" Person@Example.COM "), "person@example.com");
    assert.throws(() => normalizeEmail("not-an-email"), /invalid/);
    assert.throws(() => normalizeEmail(`${"a".repeat(250)}@x.test`), /invalid/);
});

test("Passwords use Argon2id and verification fails closed", async () => {
    assert.throws(() => validatePassword("short1"), /between 12 and 128/);
    assert.throws(() => validatePassword("onlyletterslong"), /letter and one number/);

    const password = "A-secure-passphrase-2026";
    const encoded = await hashPassword(password);
    assert.match(encoded, /^\$argon2id\$/);
    assert.equal(await verifyPassword(encoded, password), true);
    assert.equal(await verifyPassword(encoded, "wrong-password-2026"), false);
    assert.equal(await verifyPassword("not-an-argon-hash", password), false);
});

test("Opaque, OTP, expiry, and CSRF primitives preserve secret boundaries", () => {
    const token = createOpaqueToken();
    const tokenHash = hashOpaqueToken(token);
    assert.notEqual(token, tokenHash);
    assert.ok(token.length >= 40);
    assert.equal(isPlausibleOpaqueToken(token), true);
    assert.equal(isPlausibleOpaqueToken("forged"), false);

    const otp = createOtpCode();
    assert.match(otp, /^\d{6}$/);
    const pepper = "test-pepper-with-at-least-thirty-two-characters";
    assert.equal(hashOtpCode(otp, pepper), hashOtpCode(otp, pepper));
    assert.notEqual(hashOtpCode("123456", pepper), hashOtpCode("654321", pepper));
    assert.throws(() => hashOtpCode("12345", pepper), /six digits/);
    assert.throws(() => hashOtpCode("123456", "weak"), /32 characters/);

    const csrf = createOpaqueToken();
    assert.equal(verifyCsrfToken(hashOpaqueToken(csrf), csrf, csrf), true);
    assert.equal(verifyCsrfToken(hashOpaqueToken(csrf), csrf, "different"), false);
    assert.equal(verifyCsrfToken(hashOpaqueToken(csrf), null, csrf), false);

    const now = new Date("2026-08-02T00:00:00.000Z");
    assert.equal(expiresInMinutes(5, now).toISOString(), "2026-08-02T00:05:00.000Z");
    assert.equal(expiresInDays(14, now).toISOString(), "2026-08-16T00:00:00.000Z");
});

test("Auth pepper configuration fails closed", () => {
    assert.equal(
        requireAuthPepper({ AUTH_TOKEN_PEPPER: "x".repeat(32), NODE_ENV: "production" }),
        "x".repeat(32),
    );
    assert.throws(
        () => requireAuthPepper({ NODE_ENV: "production" }),
        /AUTH_TOKEN_PEPPER/,
    );
});

test("Unconfigured SMS and email gateways fail closed without network calls", async () => {
    const sms = getSmsGateway({ SMS_PROVIDER: "disabled" });
    await assert.rejects(
        sms.sendOtp({
            phoneE164: "+989123456789",
            code: "123456",
            purpose: "login",
        }),
        SmsGatewayUnavailableError,
    );
    assert.throws(
        () => getSmsGateway({ SMS_PROVIDER: "smsir" }),
        SmsGatewayUnavailableError,
    );

    const email = getEmailGateway({ EMAIL_PROVIDER: "disabled" });
    await assert.rejects(
        email.sendPasswordRecovery({
            recipient: "person@example.com",
            recoveryUrl: "https://example.com/recover",
            expiresAt: new Date(),
        }),
        EmailGatewayUnavailableError,
    );
    await assert.rejects(
        getEmailGateway({ EMAIL_PROVIDER: "smtp" }).sendContactNotification({
            recipient: "team@example.com",
            replyTo: "person@example.com",
            reference: "CNT-TEST",
            fullName: "Test Person",
            organization: null,
            topic: "Test",
            message: "A sufficiently long test contact message.",
            language: "en",
        }),
        EmailGatewayUnavailableError,
    );
});

test("Contact submission input is bounded, consented, and normalized", () => {
    const input = parseContactSubmissionInput({
        fullName: "  Test Person  ",
        email: " PERSON@Example.COM ",
        organization: "",
        topic: "Enterprise AI",
        message: "We would like to discuss a governed enterprise AI program.",
        language: "fa",
        consent: true,
    });
    assert.equal(input.fullName, "Test Person");
    assert.equal(input.email, "person@example.com");
    assert.equal(input.organization, null);
    assert.equal(input.language, "fa");
    assert.throws(
        () => parseContactSubmissionInput({ ...input, consent: false }),
        ContactValidationError,
    );
    assert.throws(
        () => parseContactSubmissionInput({ ...input, message: "short" }),
        ContactValidationError,
    );
});

test("Auth routes reject cross-origin login and logout without CSRF", async () => {
    const crossOrigin = await passwordLoginRoute(new Request("http://localhost/api/auth/password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Origin: "https://attacker.example",
        },
        body: JSON.stringify({ identifier: "person@example.com", password: "irrelevant" }),
    }));
    assert.equal(crossOrigin.status, 403);

    const malformed = await passwordLoginRoute(new Request("http://localhost/api/auth/password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost",
        },
        body: "{}",
    }));
    assert.equal(malformed.status, 401);

    const wrongMediaType = await passwordLoginRoute(new Request("http://localhost/api/auth/password", {
        method: "POST",
        headers: {
            "Content-Type": "text/plain",
            Origin: "http://localhost",
        },
        body: "{}",
    }));
    assert.equal(wrongMediaType.status, 400);

    const oversized = await passwordLoginRoute(new Request("http://localhost/api/auth/password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost",
        },
        body: JSON.stringify({ identifier: "x".repeat(4_096), password: "irrelevant" }),
    }));
    assert.equal(oversized.status, 413);

    const logout = await logoutRoute(new NextRequest("http://localhost/api/auth/logout", {
        method: "POST",
    }));
    assert.equal(logout.status, 403);
});

test("same-origin validation uses the configured public origin behind a reverse proxy", async () => {
    const previousSiteUrl = process.env.ARANDI_SITE_URL;
    process.env.ARANDI_SITE_URL = "https://arandi.ir";
    try {
        const proxied = await passwordLoginRoute(new Request("http://127.0.0.1:3000/api/auth/password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Origin: "https://arandi.ir",
            },
            body: "{}",
        }));
        assert.equal(proxied.status, 401);
    } finally {
        if (previousSiteUrl === undefined) delete process.env.ARANDI_SITE_URL;
        else process.env.ARANDI_SITE_URL = previousSiteUrl;
    }
});

test("Admin user inputs enforce bounded identifiers, roles, and status", () => {
    assert.equal(parseDisplayName("  Test User  "), "Test User");
    assert.equal(parseOptionalEmail(" USER@Example.COM "), "user@example.com");
    assert.equal(parseOptionalPhone("0912 345 6789"), "+989123456789");
    assert.deepEqual(parseRoleKeys(["Customer", "Customer", "Viewer"]), ["Customer", "Viewer"]);
    assert.equal(parseStatus("suspended"), "suspended");
    assert.throws(() => parseDisplayName("x"), UserInputError);
    assert.throws(() => parseRoleKeys(["Owner"]), UserInputError);
    assert.throws(() => parseStatus("deleted"), UserInputError);
});

test("Development mock identity is read-only for persistent user administration", async () => {
    const previousMockFlag = process.env.CMS_ENABLE_DEV_MOCK_AUTH;
    process.env.CMS_ENABLE_DEV_MOCK_AUTH = "true";
    try {
        const request = new NextRequest("http://localhost/api/admin/users", {
            headers: { cookie: "admin_mock_role=SuperAdmin" },
        });
        const principal = await requireAdminIdentityPermission(request, "user.read");
        assert.equal(principal.isMock, true);
        await assert.rejects(
            requireAdminIdentityPermission(request, "user.write", true),
            AdminIdentityForbiddenError,
        );
    } finally {
        if (previousMockFlag === undefined) delete process.env.CMS_ENABLE_DEV_MOCK_AUTH;
        else process.env.CMS_ENABLE_DEV_MOCK_AUTH = previousMockFlag;
    }
});
