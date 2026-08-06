import "dotenv/config";

import assert from "node:assert/strict";

import { POST as submitContact } from "../src/app/api/public/contact/route";
import { prisma } from "../src/lib/prisma";

const pepper = "contact-submission-verification-pepper-at-least-32-characters";
const marker = `Contact verifier ${Date.now()}`;
const origin = "http://localhost";
let reference: string | null = null;

function request(body: Record<string, unknown>, requestOrigin = origin) {
    return new Request(`${origin}/api/public/contact`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Origin: requestOrigin,
            "X-Forwarded-For": "203.0.113.44",
            "User-Agent": "Arandi contact verifier",
        },
        body: JSON.stringify(body),
    });
}

async function main() {
    const previousPepper = process.env.AUTH_TOKEN_PEPPER;
    const previousEmailProvider = process.env.EMAIL_PROVIDER;
    process.env.AUTH_TOKEN_PEPPER = pepper;
    process.env.EMAIL_PROVIDER = "disabled";
    const valid = {
        fullName: marker,
        email: "Contact.Verifier@Example.test",
        organization: "Verifier Organization",
        topic: "Enterprise platform enquiry",
        message: "This is a controlled contact submission used to verify persistence and cleanup.",
        language: "en",
        consent: true,
        website: "",
    };

    try {
        await prisma.contactSubmission.deleteMany({ where: { fullName: marker } });
        const baseline = await prisma.contactSubmission.count();

        assert.equal((await submitContact(request(valid, "https://attacker.example"))).status, 403);
        assert.equal((await submitContact(request({ ...valid, consent: false }))).status, 400);

        const honeypot = await submitContact(request({ ...valid, website: "https://bot.example" }));
        assert.equal(honeypot.status, 202);
        assert.equal(await prisma.contactSubmission.count(), baseline);

        const accepted = await submitContact(request(valid));
        assert.equal(accepted.status, 202);
        const acceptedBody = await accepted.json() as { reference?: string; deliveryState?: string };
        assert.match(acceptedBody.reference ?? "", /^CNT-[A-F0-9]{16}$/);
        assert.equal("deliveryState" in acceptedBody, false);
        reference = acceptedBody.reference ?? null;

        const stored = await prisma.contactSubmission.findUniqueOrThrow({
            where: { reference: reference! },
        });
        assert.equal(stored.email, "contact.verifier@example.test");
        assert.equal(stored.deliveryState, "unavailable");
        assert.equal(stored.deliveryAttempts, 1);
        assert.ok(stored.ipHash && stored.userAgentHash);
        assert.equal(JSON.stringify(stored).includes("203.0.113.44"), false);
        assert.equal(JSON.stringify(stored).includes("Arandi contact verifier"), false);

        const replay = await submitContact(request(valid));
        assert.equal(replay.status, 202);
        const replayBody = await replay.json() as { reference?: string };
        assert.equal(replayBody.reference, reference);
        assert.equal(await prisma.contactSubmission.count({ where: { fullName: marker } }), 1);

        const throttled = await submitContact(request({
            ...valid,
            topic: "Different enquiry",
            message: "This distinct controlled message must be rejected during the cooldown window.",
        }));
        assert.equal(throttled.status, 429);
    } finally {
        await prisma.contactSubmission.deleteMany({ where: { fullName: marker } });
        if (previousPepper === undefined) delete process.env.AUTH_TOKEN_PEPPER;
        else process.env.AUTH_TOKEN_PEPPER = previousPepper;
        if (previousEmailProvider === undefined) delete process.env.EMAIL_PROVIDER;
        else process.env.EMAIL_PROVIDER = previousEmailProvider;
    }

    console.log("Contact submission verification passed; validation, consent, honeypot, hashing, replay, throttling, delivery state, and cleanup are intact.");
}

main()
    .finally(() => prisma.$disconnect())
    .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : "Contact verification failed.");
        process.exitCode = 1;
    });
