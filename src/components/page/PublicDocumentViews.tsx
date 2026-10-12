import Image from "next/image";
import Link from "next/link";
import { BookOpen, FileText, Scale } from "lucide-react";

import type {
    PublicCollectionDetail,
    PublicDocument,
    PublicDocumentSummary,
    PublicDocumentType,
    PublicSearchResult,
} from "@/lib/public-content";

type Language = "en" | "fa";

const labels = {
    en: {
        article: { eyebrow: "Insights", title: "News and articles", empty: "No published articles are available yet." },
        knowledge: { eyebrow: "Knowledge", title: "Approved knowledge", empty: "No published knowledge documents are available yet." },
        legal: { eyebrow: "Legal", title: "Legal information", empty: "No published legal pages are available yet." },
        read: "Read",
        back: "Back to list",
        search: "Search",
        results: "Search results",
        noResults: "No published content matched your search.",
    },
    fa: {
        article: { eyebrow: "دیدگاه‌ها", title: "اخبار و مقالات", empty: "هنوز مقاله منتشرشده‌ای وجود ندارد." },
        knowledge: { eyebrow: "دانش", title: "دانش‌نامه تأییدشده", empty: "هنوز سند دانش منتشرشده‌ای وجود ندارد." },
        legal: { eyebrow: "حقوقی", title: "اطلاعات حقوقی", empty: "هنوز صفحه حقوقی منتشرشده‌ای وجود ندارد." },
        read: "مطالعه",
        back: "بازگشت به فهرست",
        search: "جست‌وجو",
        results: "نتایج جست‌وجو",
        noResults: "محتوای منتشرشده‌ای مطابق جست‌وجوی شما پیدا نشد.",
    },
} as const;

function listRoute(type: PublicDocumentType): string {
    return type === "legal" ? "/legal" : "/articles";
}

const documentIcons = { article: FileText, knowledge: BookOpen, legal: Scale } as const;

function DocumentCards({ type, lang, items, headingLevel = 2 }: {
    type: PublicDocumentType;
    lang: Language;
    items: PublicDocumentSummary[];
    headingLevel?: 2 | 3;
}) {
    const Icon = documentIcons[type];
    const Heading = headingLevel === 2 ? "h2" : "h3";
    return items.map((item) => (
        <article key={`${type}:${item.slug}`} className="flex flex-col overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
            <div className="flex min-h-28 items-end bg-[linear-gradient(135deg,rgba(14,116,144,0.16),rgba(255,255,255,0.7))] p-6">
                <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-primary/15 bg-background/72 text-primary shadow-[var(--elevation-1)]"><Icon className="size-5" aria-hidden="true" /></span>
            </div>
            <div className="flex flex-1 flex-col p-6">
                <Heading className="text-xl font-semibold text-foreground">{item.title}</Heading>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{item.description}</p>
                <Link className="ds-focus-visible mt-6 inline-flex min-h-11 items-center font-semibold text-primary hover:underline" href={`${item.route}?lang=${lang}`}>
                    {labels[lang].read}<span className="sr-only">: {item.title}</span>
                </Link>
            </div>
        </article>
    ));
}

export function PublicContentHub({ lang, articles, guides }: {
    lang: Language;
    articles: PublicDocumentSummary[];
    guides: PublicDocumentSummary[];
}) {
    const fa = lang === "fa";
    const copy = fa
        ? { eyebrow: "دیدگاه‌ها و دانش", title: "مقالات و راهنماها", description: "مقاله‌ها، دیدگاه‌ها و راهنماهای کاربردی آرن دی بنیان را در یک مسیر پیدا کنید.", articles: "مقالات", guides: "راهنماها", guideIntro: "راهنماهای گام‌به‌گام محصولات و محتوای دانشی", jupiter: "آموزش راه‌اندازی و استفاده از ژوپیتر", jupiterDescription: "راهنمای مدیر سازمان، کاربران سازمان و کاربران مستقل؛ همراه با مراحل کاربردی و نسخهٔ PDF.", viewGuide: "مشاهدهٔ راهنمای ژوپیتر" }
        : { eyebrow: "Insights and knowledge", title: "Articles and guides", description: "Explore Arandi articles, insights, and practical guides in one place.", articles: "Articles", guides: "Guides", guideIntro: "Step-by-step product guides and knowledge resources", jupiter: "", jupiterDescription: "", viewGuide: "" };
    const publishedGuides = guides.filter((item) => item.route !== "/knowledge/jupiter-guide");

    return <div data-content-source="prisma" className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">{copy.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{copy.title}</h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground">{copy.description}</p>
        </header>
        <nav aria-label={copy.title} className="mt-8 flex flex-wrap gap-3">
            <a className="ds-focus-visible inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-primary hover:bg-muted" href="#hub-articles">{copy.articles}</a>
            <a className="ds-focus-visible inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-primary hover:bg-muted" href="#hub-guides">{copy.guides}</a>
        </nav>

        <section id="hub-articles" aria-labelledby="hub-articles-title" className="mt-14 scroll-mt-32">
            <h2 id="hub-articles-title" className="text-2xl font-semibold text-foreground sm:text-3xl">{copy.articles}</h2>
            {articles.length ? <div className="mt-7 grid gap-5 md:grid-cols-2"><DocumentCards type="article" lang={lang} items={articles} headingLevel={3} /></div>
                : <p className="mt-7 rounded-2xl border border-border/70 bg-card p-6 text-muted-foreground">{labels[lang].article.empty}</p>}
        </section>

        <section id="hub-guides" aria-labelledby="hub-guides-title" className="mt-16 scroll-mt-32">
            <h2 id="hub-guides-title" className="text-2xl font-semibold text-foreground sm:text-3xl">{copy.guides}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{copy.guideIntro}</p>
            {fa || publishedGuides.length ? <div className="mt-7 grid gap-5 md:grid-cols-2">
                {fa ? <article data-guide-id="jupiter" className="flex flex-col overflow-hidden rounded-[1.5rem] border border-[#796E89]/25 bg-[linear-gradient(120deg,#f8f7f9,#f0edf3)] shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)]">
                    <div className="flex min-h-28 items-center bg-white/50 px-6 py-3">
                        <Image src="/brand/jupiter-logo.png" alt="لوگوی ژوپیتر" width={1774} height={887} className="h-20 w-auto max-w-full object-contain object-right" sizes="200px" />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                        <h3 className="text-xl font-semibold text-foreground">{copy.jupiter}</h3>
                        <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{copy.jupiterDescription}</p>
                        <Link className="ds-focus-visible mt-6 inline-flex min-h-11 items-center font-semibold text-primary hover:underline" href="/knowledge/jupiter-guide?lang=fa">{copy.viewGuide}</Link>
                    </div>
                </article> : null}
                <DocumentCards type="knowledge" lang={lang} items={publishedGuides} headingLevel={3} />
            </div> : <p className="mt-7 rounded-2xl border border-border/70 bg-card p-6 text-muted-foreground">{labels[lang].knowledge.empty}</p>}
        </section>
    </div>;
}

export function PublicDocumentList({
    type,
    lang,
    items,
}: {
    type: PublicDocumentType;
    lang: Language;
    items: PublicDocumentSummary[];
}) {
    const copy = labels[lang][type];
    return (
        <div data-content-source="prisma" className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <header className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{copy.eyebrow}</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{copy.title}</h1>
            </header>
            {items.length === 0 ? (
                <p className="mt-12 rounded-2xl border border-border/70 bg-card p-6 text-muted-foreground">{copy.empty}</p>
            ) : (
                <section className={items.length === 1 ? "mt-12 max-w-3xl" : "mt-12 grid gap-5 md:grid-cols-2"} aria-label={copy.title}>
                    <DocumentCards type={type} lang={lang} items={items} />
                </section>
            )}
        </div>
    );
}

export function PublicDocumentView({ document, lang }: { document: PublicDocument; lang: Language }) {
    return (
        <div data-content-source="prisma" className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <Link className="text-sm font-semibold text-primary hover:underline" href={`${listRoute(document.type)}?lang=${lang}`}>
                {labels[lang].back}
            </Link>
            <article className="mt-8">
                <header className="rounded-[2rem] border border-border/70 bg-card p-7 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.3)] sm:p-10">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                        {labels[lang][document.type].eyebrow}
                    </p>
                    <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{document.hero.title}</h1>
                    <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">{document.hero.description}</p>
                </header>
                <div className="mt-8 space-y-8">
                    {document.sections.map((section) => (
                        <section key={section.key} className="rounded-[1.5rem] border border-border/70 bg-card p-7 sm:p-9">
                            <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>
                            {section.subtitle ? <p className="mt-3 text-base text-muted-foreground">{section.subtitle}</p> : null}
                            <div className="mt-6 space-y-5">
                                {section.paragraphs.map((paragraph) => (
                                    <p key={paragraph} className="text-base leading-8 text-muted-foreground">{paragraph}</p>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </article>
        </div>
    );
}

export function PublicSearchView({
    lang,
    query,
    results,
}: {
    lang: Language;
    query: string;
    results: PublicSearchResult[];
}) {
    const copy = labels[lang];
    return (
        <div data-content-source="prisma" className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{copy.results}</h1>
            <form action="/search" method="get" className="mt-8 flex flex-col gap-3 sm:flex-row">
                <input type="hidden" name="lang" value={lang} />
                <label className="sr-only" htmlFor="public-search">{copy.search}</label>
                <input
                    id="public-search"
                    name="q"
                    defaultValue={query}
                    maxLength={100}
                    className="h-12 flex-1 rounded-xl border border-border bg-background px-4 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button className="h-12 rounded-xl bg-primary px-6 font-semibold text-primary-foreground" type="submit">{copy.search}</button>
            </form>
            {query.length >= 2 ? (
                results.length > 0 ? (
                    <section className="mt-10 space-y-4" aria-live="polite">
                        {results.map((result) => (
                            <article key={`${result.pageType}:${result.slug}`} className="rounded-2xl border border-border/70 bg-card p-6">
                                <h2 className="text-xl font-semibold text-foreground">
                                    <Link className="hover:text-primary hover:underline" href={`${result.route}?lang=${lang}`}>{result.title}</Link>
                                </h2>
                                <p className="mt-2 text-sm leading-7 text-muted-foreground">{result.description}</p>
                            </article>
                        ))}
                    </section>
                ) : <p className="mt-10 text-muted-foreground" aria-live="polite">{copy.noResults}</p>
            ) : null}
        </div>
    );
}

export function PublicCollectionDetailView({
    detail,
    lang,
}: {
    detail: PublicCollectionDetail;
    lang: Language;
}) {
    const collectionLabel = {
        en: { services: "Services", solutions: "Solutions", industries: "Industries", projects: "Projects", contact: "Discuss this capability", projectContact: "Discuss this project" },
        fa: { services: "خدمات", solutions: "راهکارها", industries: "صنایع", projects: "پروژه‌ها", contact: "گفت‌وگو درباره این توانمندی", projectContact: "گفت‌وگو درباره این پروژه" },
    }[lang];
    return (
        <div data-content-source="prisma" className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <Link className="text-sm font-semibold text-primary hover:underline" href={`/${detail.collection}?lang=${lang}`}>
                {collectionLabel[detail.collection]}
            </Link>
            <article className="mt-8 rounded-[2rem] border border-border/70 bg-card p-7 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.3)] sm:p-10">
                {detail.mediaUrl ? (
                    <div className="relative -mx-2 mb-8 aspect-[16/7] overflow-hidden rounded-[1.5rem] bg-muted sm:mx-0">
                        <Image src={detail.mediaUrl} alt={detail.mediaAlt ?? detail.title} fill sizes="(max-width: 1024px) 100vw, 960px" className="object-cover" />
                    </div>
                ) : null}
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{detail.eyebrow}</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{detail.title}</h1>
                <p className="mt-6 text-base leading-8 text-muted-foreground">{detail.summary}</p>
                {detail.highlight ? (
                    <p className="mt-7 rounded-2xl border border-primary/20 bg-primary/5 p-5 font-medium leading-7 text-primary">{detail.highlight}</p>
                ) : null}
                {detail.projectDetails ? <ProjectDetails details={detail.projectDetails} lang={lang} /> : null}
                <Link className="mt-8 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground" href={`/contact?lang=${lang}`}>
                    {detail.collection === "projects" ? collectionLabel.projectContact : collectionLabel.contact}
                </Link>
            </article>
        </div>
    );
}

function ProjectDetails({ details, lang }: { details: NonNullable<PublicCollectionDetail["projectDetails"]>; lang: Language }) {
    const labels = lang === "fa"
        ? { client: "کارفرما / نوع پروژه", industry: "صنعت", overview: "معرفی پروژه", scope: "دامنهٔ فعالیت‌ها", technologies: "فناوری‌ها و قابلیت‌های کلیدی", outcome: "دستاورد" }
        : { client: "Client / Project type", industry: "Industry", overview: "Project overview", scope: "Scope of work", technologies: "Key technologies & capabilities", outcome: "Outcome" };
    return <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-border/70 bg-background/60 p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{labels.client}</p><p className="mt-2 font-semibold text-foreground">{details.client}</p></section>
        <section className="rounded-2xl border border-border/70 bg-background/60 p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{labels.industry}</p><p className="mt-2 font-semibold text-foreground">{details.industry}</p></section>
        <section className="rounded-2xl border border-border/70 bg-background/60 p-5 md:col-span-2"><h2 className="text-xl font-semibold text-foreground">{labels.overview}</h2><p className="mt-3 leading-8 text-muted-foreground">{details.overview}</p></section>
        <section className="rounded-2xl border border-border/70 bg-background/60 p-5"><h2 className="text-xl font-semibold text-foreground">{labels.scope}</h2><ul className="mt-4 space-y-2 text-sm leading-7 text-muted-foreground">{details.scope.map((item) => <li key={item}>• {item}</li>)}</ul></section>
        <section className="rounded-2xl border border-border/70 bg-background/60 p-5"><h2 className="text-xl font-semibold text-foreground">{labels.technologies}</h2><ul className="mt-4 space-y-2 text-sm leading-7 text-muted-foreground">{details.technologies.map((item) => <li key={item}>• {item}</li>)}</ul></section>
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5 md:col-span-2"><h2 className="text-xl font-semibold text-primary">{labels.outcome}</h2><p className="mt-3 leading-8 text-foreground">{details.outcome}</p></section>
    </div>;
}
