import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type JupiterGuideFeature = { title: string; body: string };
export type JupiterGuideQuestion = { question: string; answer: string };

export type JupiterGuideContent = {
    title: string;
    description: string;
    introduction: string;
    features: JupiterGuideFeature[];
    paths: Record<"organization-admin" | "organization-user" | "independent-user", string>;
    troubleshooting: string;
    questions: JupiterGuideQuestion[];
    closing: string;
};

const SECTION_TITLES = [
    "Hero",
    "ژوپیتر چیست و چه مسئله‌ای را حل می‌کند؟",
    "امکانات ژوپیتر در یک نگاه",
    "مسیر اول: راه‌اندازی ژوپیتر برای مدیر یا مالک سازمان",
    "مسیر دوم: استفاده روزمره برای کاربران سازمان",
    "مسیر سوم: راهنمای کاربر مستقل",
    "رفع اشکال سریع",
    "پرسش‌های متداول",
    "CTA پایانی",
] as const;

function splitSections(source: string): Map<string, string> {
    const parts = source.split(/^## /m);
    const sections = new Map<string, string>();
    for (const part of parts.slice(1)) {
        const newline = part.indexOf("\n");
        if (newline < 0) continue;
        sections.set(part.slice(0, newline).trim(), part.slice(newline + 1).trim().replace(/\n---\s*$/u, "").trim());
    }
    for (const title of SECTION_TITLES) {
        if (!sections.has(title)) throw new Error(`Jupiter guide section is missing: ${title}`);
    }
    return sections;
}

function required(sections: Map<string, string>, title: string): string {
    const value = sections.get(title);
    if (!value) throw new Error(`Jupiter guide section is empty: ${title}`);
    return value;
}

function stripFormatting(value: string): string {
    return value
        .replace(/\*\*/gu, "")
        .replace(/`/gu, "")
        .replace(/\s+/gu, " ")
        .trim();
}

export async function loadJupiterGuide(): Promise<JupiterGuideContent> {
    const source = await readFile(join(process.cwd(), "src/content/jupiter-guide.fa.md"), "utf8");
    const sections = splitSections(source);
    const hero = required(sections, "Hero");
    const title = hero.match(/^\*\*عنوان:\*\*\s*(.+)$/mu)?.[1]?.trim();
    const description = hero.match(/\*\*توضیح:\*\*\s*([\s\S]*?)\s*\*\*CTA اصلی:/u)?.[1]?.replace(/\s+/gu, " ").trim();
    if (!title || !description) throw new Error("Jupiter guide hero is incomplete.");

    const featuresSource = required(sections, "امکانات ژوپیتر در یک نگاه");
    const featuresPart = featuresSource.split(/^### مسیر مناسب من کدام است؟/mu)[0];
    const features = featuresPart.split(/^### /m).slice(1).map((part) => {
        const newline = part.indexOf("\n");
        return { title: part.slice(0, newline).trim(), body: part.slice(newline + 1).trim() };
    });
    if (features.length < 10) throw new Error("Jupiter guide feature list is incomplete.");

    const questionParts = required(sections, "پرسش‌های متداول").split(/^### /m).slice(1);
    const questions = questionParts.map((part) => {
        const newline = part.indexOf("\n");
        return { question: part.slice(0, newline).trim(), answer: part.slice(newline + 1).trim() };
    });
    if (questions.length < 5) throw new Error("Jupiter guide FAQ is incomplete.");

    return {
        title,
        description,
        introduction: required(sections, "ژوپیتر چیست و چه مسئله‌ای را حل می‌کند؟"),
        features,
        paths: {
            "organization-admin": `## مسیر اول: راه‌اندازی ژوپیتر برای مدیر یا مالک سازمان\n\n${required(sections, "مسیر اول: راه‌اندازی ژوپیتر برای مدیر یا مالک سازمان")}`,
            "organization-user": `## مسیر دوم: استفاده روزمره برای کاربران سازمان\n\n${required(sections, "مسیر دوم: استفاده روزمره برای کاربران سازمان")}`,
            "independent-user": `## مسیر سوم: راهنمای کاربر مستقل\n\n${required(sections, "مسیر سوم: راهنمای کاربر مستقل")}`,
        },
        troubleshooting: `## رفع اشکال سریع\n\n${required(sections, "رفع اشکال سریع")}`,
        questions,
        closing: required(sections, "CTA پایانی"),
    };
}

export function jupiterFaqSchema(questions: JupiterGuideQuestion[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: stripFormatting(answer) },
        })),
    };
}
