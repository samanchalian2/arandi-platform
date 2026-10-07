"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUpLeft, BookOpen, ChevronDown, Download, FileText, Printer, Search } from "lucide-react";

import type { JupiterGuideContent } from "@/lib/jupiter-guide";
import type { JupiterGuideLinks } from "@/lib/public-content/jupiter-guide";

import styles from "./JupiterGuide.module.css";

type PathId = keyof JupiterGuideContent["paths"];

const paths: Array<{ id: PathId; title: string; description: string; time: string }> = [
    { id: "organization-admin", title: "مدیر یا مالک سازمان هستم", description: "ثبت سازمان، تنظیم خدمات و راه‌اندازی ژوپیتر", time: "۲۰ دقیقه" },
    { id: "organization-user", title: "عضو یک سازمان هستم", description: "ثبت درخواست، پیگیری پاسخ و استفادهٔ روزمره", time: "۷ دقیقه" },
    { id: "independent-user", title: "کاربر مستقل هستم", description: "دریافت عضویت یا شروع ثبت سازمان خودم", time: "۳ دقیقه" },
];

function headingId(scope: string, text: string): string {
    return `${scope}-${text.trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/gu, "")}`;
}

function headings(markdown: string, scope: string) {
    return [...markdown.matchAll(/^#{2,4} (.+)$/gm)].map((match) => ({ title: match[1].trim(), id: headingId(scope, match[1]) }));
}

function Markdown({ source, scope }: { source: string; scope: string }) {
    return <div className={styles.markdown}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
            h2: ({ children }) => <h2 id={headingId(scope, String(children))}>{children}</h2>,
            h3: ({ children }) => <h3 id={headingId(scope, String(children))}>{children}</h3>,
            h4: ({ children }) => <h4 id={headingId(scope, String(children))}>{children}</h4>,
            a: ({ children, href }) => href ? <a href={href} rel="noopener noreferrer">{children}</a> : <span>{children}</span>,
            input: ({ checked }) => <span aria-hidden="true" className={styles.checklistMarker}>{checked ? "☑" : "☐"}</span>,
        }}>{source}</ReactMarkdown>
    </div>;
}

function Cta({ href, children, primary = false, host }: { href: string; children: React.ReactNode; primary?: boolean; host: string }) {
    if (!href) return null;
    let external = false;
    try { external = new URL(href, `https://${host}`).hostname !== host; } catch { return null; }
    const className = primary ? styles.primaryCta : styles.secondaryCta;
    return <a href={href} className={className} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
        {children}<ArrowUpLeft size={17} aria-hidden="true" />{external ? <span className="sr-only">، بازشدن در برگهٔ جدید</span> : null}
    </a>;
}

function GuideTabs({ active, onSelect }: { active: PathId; onSelect: (path: PathId) => void }) {
    function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const current = paths.findIndex(({ id }) => id === active);
        const next = event.key === "ArrowLeft" ? (current + 1) % paths.length
            : event.key === "ArrowRight" ? (current + paths.length - 1) % paths.length
            : event.key === "Home" ? 0
            : event.key === "End" ? paths.length - 1 : -1;
        if (next < 0) return;
        event.preventDefault();
        onSelect(paths[next].id);
        document.getElementById(`jupiter-tab-${paths[next].id}`)?.focus();
    }
    return <div className={styles.tabList} role="tablist" aria-label="مسیرهای آموزش ژوپیتر" onKeyDown={onKeyDown}>
        {paths.map(({ id, title, description, time }) => <button key={id} id={`jupiter-tab-${id}`} type="button" role="tab"
            aria-selected={active === id} aria-controls={`jupiter-panel-${id}`} tabIndex={active === id ? 0 : -1}
            onClick={() => onSelect(id)} className={`${styles.tab} ${active === id ? styles.tabActive : ""}`}>
            <span className={styles.tabTitle}>{title}</span>
            <span className={styles.tabDescription}>{description}</span>
            <span className={styles.tabTime}>زمان مطالعه: {time}</span>
        </button>)}
    </div>;
}

export function JupiterGuide({ content, links, pdfPath, host }: {
    content: JupiterGuideContent;
    links: JupiterGuideLinks;
    pdfPath: string;
    host: string;
}) {
    const [active, setActive] = useState<PathId>("organization-user");
    const [query, setQuery] = useState("");
    const [openQuestion, setOpenQuestion] = useState<number | null>(null);
    const [tocOpen, setTocOpen] = useState(false);

    useEffect(() => {
        const syncHash = () => {
            const requested = window.location.hash.slice(1);
            if (paths.some(({ id }) => id === requested)) setActive(requested as PathId);
        };
        syncHash();
        window.addEventListener("hashchange", syncHash);
        window.addEventListener("popstate", syncHash);
        return () => { window.removeEventListener("hashchange", syncHash); window.removeEventListener("popstate", syncHash); };
    }, []);

    const selectedMarkdown = content.paths[active];
    const selectedHeadings = useMemo(() => headings(selectedMarkdown, active), [selectedMarkdown, active]);
    const searchResults = useMemo(() => {
        const term = query.trim().toLocaleLowerCase("fa");
        if (term.length < 2) return [];
        return [
            ...selectedHeadings.map((item) => ({ ...item, kind: "مسیر انتخاب‌شده" as const })),
            ...content.questions.map((item, index) => ({ title: item.question, id: `jupiter-faq-${index}`, kind: "پرسش متداول" as const })),
        ].filter(({ title }) => title.toLocaleLowerCase("fa").includes(term)).slice(0, 12);
    }, [query, selectedHeadings, content.questions]);

    const selectPath = (id: PathId) => {
        if (id === active && window.location.hash === `#${id}`) return;
        window.history.pushState(null, "", `#${id}`);
        setActive(id);
        setQuery("");
        setTocOpen(false);
    };
    const goTo = (id: string) => {
        if (id.startsWith("jupiter-faq-")) setOpenQuestion(Number(id.slice("jupiter-faq-".length)));
        requestAnimationFrame(() => {
            const target = document.getElementById(id);
            const disclosure = target?.closest("details");
            if (disclosure) disclosure.open = true;
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        setTocOpen(false);
    };

    const userAdvancedMarker = "### اگر کارشناس یا سرپرست هستید";
    const userChecklistMarker = "### Checklist کاربر سازمان";
    const userParts = active === "organization-user" && selectedMarkdown.includes(userAdvancedMarker)
        ? selectedMarkdown.split(userAdvancedMarker) : null;
    const userAdvancedParts = userParts?.[1]?.split(userChecklistMarker);

    return <div className={styles.guide} lang="fa" dir="rtl">
        <div className={styles.container}>
            <nav className={styles.breadcrumb} aria-label="مسیر صفحه">
                <Link href="/?lang=fa">خانه</Link><span aria-hidden="true">/</span><Link href="/knowledge?lang=fa">دانش‌نامه</Link><span aria-hidden="true">/</span><span aria-current="page">راهنمای ژوپیتر</span>
            </nav>

            <header className={styles.hero}>
                <div className={styles.heroCopy}>
                    <p className={styles.eyebrow}>راهنمای محصول Jupiter{links.companyName ? ` · ${links.companyName}` : ""}</p>
                    <h1>{content.title}</h1>
                    <p>{content.description}</p>
                    <div className={styles.actions}>
                        <Cta href={links.appUrl} primary host={host}>ورود به ژوپیتر</Cta>
                        <Cta href={links.organizationRequestUrl} host={host}>ثبت درخواست سازمان</Cta>
                        <a href={pdfPath} target="_blank" rel="noopener noreferrer" className={styles.pdfCta}><FileText size={18} aria-hidden="true" />مشاهده راهنمای PDF<span className="sr-only"> در برگهٔ جدید</span></a>
                    </div>
                </div>
                <div className={styles.heroAside} aria-hidden="true"><span>J</span><span className={styles.heroOrbit} /></div>
            </header>

            <section className={styles.intro} aria-labelledby="jupiter-intro-title">
                <div className={styles.sectionHeading}><p>آشنایی با محصول</p><h2 id="jupiter-intro-title">ژوپیتر چیست و چه مسئله‌ای را حل می‌کند؟</h2></div>
                <Markdown source={content.introduction} scope="intro" />
            </section>

            <section className={styles.features} aria-labelledby="jupiter-features-title">
                <div className={styles.sectionHeading}><p>امکانات در یک نگاه</p><h2 id="jupiter-features-title">از ثبت درخواست تا پاسخ‌گویی منظم</h2></div>
                <div className={styles.featureGrid}>{content.features.map(({ title, body }) => <article key={title} className={styles.feature}>
                    <h3>{title}</h3><Markdown source={body} scope={`feature-${title}`} />
                </article>)}</div>
            </section>

            <section className={styles.learning} aria-labelledby="jupiter-choose-title">
                <div className={styles.sectionHeading}><p>آموزش متناسب با نقش شما</p><h2 id="jupiter-choose-title">مسیر مناسب خود را انتخاب کنید</h2></div>
                <GuideTabs active={active} onSelect={selectPath} />
                <div className={styles.learningLayout}>
                    <div className={styles.toc} role="group" aria-label="فهرست مطالب مسیر انتخاب‌شده">
                        <button className={styles.mobileTocToggle} type="button" aria-expanded={tocOpen} aria-controls="jupiter-toc-list" onClick={() => setTocOpen(!tocOpen)}><BookOpen size={18} aria-hidden="true" />فهرست مطالب<ChevronDown size={17} aria-hidden="true" /></button>
                        <div id="jupiter-toc-list" className={`${styles.tocList} ${tocOpen ? styles.tocOpen : ""}`}>
                            <p>در این مسیر</p>
                            {selectedHeadings.filter(({ title }) => !title.startsWith("مسیر ")).map(({ title, id }) => <button type="button" key={id} onClick={() => goTo(id)}>{title}</button>)}
                        </div>
                    </div>
                    <div className={styles.reader}>
                        <div className={styles.readerTools}>
                            <label className={styles.search}><Search size={18} aria-hidden="true" /><span className="sr-only">جست‌وجو در عنوان مراحل و پرسش‌ها</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجو در مراحل و پرسش‌ها" /></label>
                            <button className={styles.printButton} type="button" onClick={() => window.print()}><Printer size={17} aria-hidden="true" />چاپ راهنما</button>
                        </div>
                        {query.trim().length >= 2 ? <div className={styles.searchResults} aria-live="polite">
                            <p>{searchResults.length ? `${searchResults.length} عنوان پیدا شد` : "عنوانی پیدا نشد؛ عبارت دیگری را امتحان کنید."}</p>
                            {searchResults.map(({ id, title, kind }) => <button key={id} type="button" onClick={() => goTo(id)}><span>{title}</span><small>{kind}</small></button>)}
                        </div> : null}
                        {paths.map(({ id }) => <section key={id} id={`jupiter-panel-${id}`} role="tabpanel" aria-labelledby={`jupiter-tab-${id}`} hidden={active !== id} className={styles.panel}>
                            {id === "organization-admin" ? <>
                                <div className={styles.progressHeader}><p>پس از پنج گام ثبت و تأیید سازمان</p><h3>ده گام راه‌اندازی درون سازمان</h3></div>
                                <div className={styles.progress} aria-label="مراحل ده‌گانهٔ راه‌اندازی">
                                    {selectedHeadings.filter(({ title }) => /^مرحله (?:[۶-۹]|۱[۰-۵]):/u.test(title)).map(({ title, id: headingTarget }) => <button key={headingTarget} type="button" onClick={() => goTo(headingTarget)}>{title.replace(/^مرحله /u, "")}</button>)}
                                </div>
                                <Markdown source={content.paths[id]} scope={id} />
                            </> : id === "organization-user" && userParts && userAdvancedParts ? <>
                                <Markdown source={userParts[0]} scope={id} />
                                <details className={styles.advanced}><summary>اگر کارشناس یا سرپرست هستید</summary><Markdown source={userAdvancedParts[0].replace(/^\s*این بخش تکمیلی را در Accordion نمایش بده\.\s*/u, "")} scope={id} /></details>
                                <Markdown source={`${userChecklistMarker}${userAdvancedParts[1] ?? ""}`} scope={id} />
                            </> : <Markdown source={content.paths[id]} scope={id} />}
                        </section>)}
                    </div>
                </div>
            </section>

            <section className={styles.supporting} aria-labelledby="jupiter-help-title"><div className={styles.sectionHeading}><p>پاسخ‌های کوتاه</p><h2 id="jupiter-help-title">رفع اشکال سریع</h2></div><Markdown source={content.troubleshooting.replace(/^## رفع اشکال سریع\s*/u, "")} scope="troubleshoot" /></section>

            <section className={styles.faq} aria-labelledby="jupiter-faq-title"><div className={styles.sectionHeading}><p>پرسش‌های متداول</p><h2 id="jupiter-faq-title">پاسخ به پرسش‌های رایج</h2></div>
                <div className={styles.faqList}>{content.questions.map(({ question, answer }, index) => <div key={question} id={`jupiter-faq-${index}`} className={styles.faqItem}>
                    <h3><button type="button" aria-expanded={openQuestion === index} aria-controls={`jupiter-faq-answer-${index}`} onClick={() => setOpenQuestion(openQuestion === index ? null : index)}>{question}<ChevronDown size={18} aria-hidden="true" /></button></h3>
                    <div id={`jupiter-faq-answer-${index}`} hidden={openQuestion !== index}><Markdown source={answer} scope={`faq-${index}`} /></div>
                </div>)}</div>
            </section>

            <section className={styles.closing} aria-labelledby="jupiter-closing-title"><div><p>گام بعدی</p><h2 id="jupiter-closing-title">آماده‌اید با ژوپیتر شروع کنید؟</h2><p>{content.closing.match(/\*\*متن:\*\*\s*([\s\S]*?)(?:\n\n- دکمه اصلی:|$)/u)?.[1]?.replace(/\s+/gu, " ").trim()}</p></div><div className={styles.actions}><Cta href={links.appUrl} primary host={host}>ورود به ژوپیتر</Cta><Cta href={links.organizationRequestUrl} host={host}>ثبت درخواست سازمان</Cta><Cta href={links.supportUrl} host={host}>دریافت کمک</Cta></div></section>
            <div className={styles.pdfFooter}><Download size={18} aria-hidden="true" /><span>نسخهٔ ۱۵ صفحه‌ای برای مطالعه یا چاپ:</span><a href={pdfPath} target="_blank" rel="noopener noreferrer">باز کردن PDF<span className="sr-only"> در برگهٔ جدید</span></a></div>
        </div>
    </div>;
}
