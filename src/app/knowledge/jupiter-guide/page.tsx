import type { Metadata } from "next";
import Link from "next/link";

import { JupiterGuide } from "@/components/jupiter/JupiterGuide";
import { jupiterFaqSchema, loadJupiterGuide } from "@/lib/jupiter-guide";
import { getSiteOrigin, resolveLanguage } from "@/lib/pageMetadata";
import { getJupiterGuideLinks } from "@/lib/public-content/jupiter-guide";

type Props = { searchParams?: Promise<{ lang?: string }> | { lang?: string } };

const guidePath = "/knowledge/jupiter-guide";
const pdfPath = "/guides/jupiter-comprehensive-user-guide-fa.pdf";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const lang = await resolveLanguage(searchParams);
    const title = lang === "fa" ? "آموزش کامل راه‌اندازی و استفاده از ژوپیتر" : "Jupiter user guide — Persian edition";
    const description = lang === "fa"
        ? "معرفی ژوپیتر و راهنمای گام‌به‌گام ثبت سازمان، راه‌اندازی پنل، افزودن کاربران و ثبت و پیگیری تیکت در سامانه مدیریت خدمات پشتیبانی ژوپیتر."
        : "The complete Jupiter onboarding and user guide is currently available in Persian.";
    return {
        title,
        description,
        robots: lang === "fa" ? { index: true, follow: true } : { index: false, follow: true },
        alternates: { canonical: `${guidePath}?lang=fa` },
        openGraph: { title, description, url: `${guidePath}?lang=fa`, locale: "fa_IR", type: "article" },
    };
}

export default async function JupiterGuidePage({ searchParams }: Props) {
    const lang = await resolveLanguage(searchParams);
    if (lang === "en") {
        return <section className="mx-auto max-w-3xl px-5 py-20 text-left" lang="en" dir="ltr">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Jupiter guide</p>
            <h1 className="mt-4 text-3xl font-semibold text-foreground">The guide is available in Persian</h1>
            <p className="mt-4 text-base leading-8 text-muted-foreground">The complete, reviewed training content has not yet been translated into English.</p>
            <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`${guidePath}?lang=fa`} className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">Read the Persian guide</Link>
                <a href={pdfPath} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-semibold text-foreground">Open the Persian PDF</a>
            </div>
        </section>;
    }

    const [content, links] = await Promise.all([loadJupiterGuide(), getJupiterGuideLinks()]);
    const origin = getSiteOrigin();
    const jsonLd = [
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "خانه", item: `${origin}/?lang=fa` },
            { "@type": "ListItem", position: 2, name: "دانش‌نامه", item: `${origin}/knowledge?lang=fa` },
            { "@type": "ListItem", position: 3, name: content.title, item: `${origin}${guidePath}?lang=fa` },
        ] },
        jupiterFaqSchema(content.questions),
    ];
    return <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <JupiterGuide content={content} links={links} pdfPath={pdfPath} host={new URL(origin).hostname} />
    </>;
}
