import "server-only";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import { defaultScrollwiseCopy, scrollwiseSceneKeys, type ScrollwiseCopy, type ScrollwiseSceneKey } from "@/lib/scrollwise-copy";

import { PUBLIC_CONTENT_TAG, PUBLIC_SETTINGS_TAG } from "./cache";
import { getPublicEnterprisePage } from "./enterprise-pages";
import { getPublicHomepageContent } from "./home";

export type { ScrollwiseSceneKey } from "@/lib/scrollwise-copy";

export type ScrollwiseMotionPreset = "subtle" | "balanced" | "cinematic";
export type ScrollwiseMenuMode = "narrative" | "classic";

export type ScrollwiseDisplaySettings = {
    motionPreset: ScrollwiseMotionPreset;
    showMotionControl: boolean;
    menuMode: ScrollwiseMenuMode;
    headerLogoSize: number;
    headerTitleSize: number;
    headingScale: number;
    veilOpacity: number;
    storyHeight: number;
    interludeHeight: number;
};

export type ScrollwiseChapter = {
    key: ScrollwiseSceneKey;
    number: string;
    eyebrow: string;
    title: string;
    description: string;
    desktopImage: string;
    mobileImage: string;
    imageAlt: string;
    role: "prelude" | "chapter" | "episode" | "finale";
    chapterNumber?: string;
    bridge: string;
    assistantPrompt: string;
    action?: { label: string; href: string };
    highlights: Array<{ title: string; summary: string; href: string; image?: string }>;
    interlude: {
        eyebrow: string;
        title: string;
        description: string;
        nextLabel: string;
    };
};

export type ScrollwiseExperience = {
    language: "en" | "fa";
    intro: { badge: string; title: string; description: string; primaryCta: string; secondaryCta: string };
    chapters: ScrollwiseChapter[];
    metrics: { projects: number; services: number; industries: number };
    display: ScrollwiseDisplaySettings;
};

const defaultDisplay: ScrollwiseDisplaySettings = {
    motionPreset: "cinematic",
    showMotionControl: false,
    menuMode: "narrative",
    headerLogoSize: 48,
    headerTitleSize: 16,
    headingScale: 100,
    veilOpacity: 0.94,
    storyHeight: 150,
    interludeHeight: 90,
};

const sceneFiles: Record<ScrollwiseSceneKey, string> = {
    gateway: "v2-01-gateway",
    discover: "v2-02-discover",
    design: "v2-03-design",
    buildSecure: "v2-04-build-secure",
    oilGas: "v2-05-oil-gas",
    petrochemical: "v2-06-petrochemical",
    connectedOperations: "v2-07-connected-operations",
    intelligence: "v2-08-intelligence",
    outcomes: "v2-09-outcomes",
    finale: "v2-10-finale",
};

function defaults(key: ScrollwiseSceneKey) {
    const file = sceneFiles[key];
    return {
        desktopImage: `/media-generated/scrollwise/${file}-desktop.webp`,
        mobileImage: `/media-generated/scrollwise/${file}-mobile.webp`,
    };
}

function isSafeImagePath(value: unknown): value is string {
    return typeof value === "string"
        && value.startsWith("/")
        && !value.startsWith("//")
        && !value.includes("..")
        && !value.includes("?")
        && !value.includes("#")
        && /\.(?:avif|jpe?g|png|webp)$/i.test(value);
}

const loadScrollwiseSettings = unstable_cache(
    () => prisma.setting.findMany({
        where: { key: { in: ["site.scrollwiseScenes", "site.scrollwiseExperience", "site.scrollwiseCopy"] } },
        select: { key: true, value: true },
    }),
    ["arandi-scrollwise-settings-v6"],
    { tags: [PUBLIC_CONTENT_TAG, PUBLIC_SETTINGS_TAG], revalidate: 3_600 },
);

function boundedNumber(value: unknown, fallback: number, minimum: number, maximum: number) {
    return typeof value === "number" && Number.isFinite(value)
        ? Math.min(maximum, Math.max(minimum, value))
        : fallback;
}

async function resolveScrollwiseSettings() {
    const settings = await loadScrollwiseSettings();
    const sceneSetting = settings.find((setting) => setting.key === "site.scrollwiseScenes");
    const displaySetting = settings.find((setting) => setting.key === "site.scrollwiseExperience");
    const copySetting = settings.find((setting) => setting.key === "site.scrollwiseCopy");
    const root = sceneSetting?.value && typeof sceneSetting.value === "object" && !Array.isArray(sceneSetting.value)
        ? sceneSetting.value as Record<string, unknown>
        : {};
    const scenes = Object.fromEntries((Object.keys(sceneFiles) as ScrollwiseSceneKey[]).map((key) => {
        const fallback = defaults(key);
        const raw = root[key] && typeof root[key] === "object" && !Array.isArray(root[key])
            ? root[key] as Record<string, unknown>
            : {};
        return [key, {
            desktopImage: isSafeImagePath(raw.desktopUrl) ? raw.desktopUrl : fallback.desktopImage,
            mobileImage: isSafeImagePath(raw.mobileUrl) ? raw.mobileUrl : fallback.mobileImage,
        }];
    })) as Record<ScrollwiseSceneKey, ReturnType<typeof defaults>>;
    const rawDisplay = displaySetting?.value && typeof displaySetting.value === "object" && !Array.isArray(displaySetting.value)
        ? displaySetting.value as Record<string, unknown>
        : {};
    const motionPreset = rawDisplay.motionPreset === "subtle" || rawDisplay.motionPreset === "balanced" || rawDisplay.motionPreset === "cinematic"
        ? rawDisplay.motionPreset
        : defaultDisplay.motionPreset;
    const rawCopy = copySetting?.value && typeof copySetting.value === "object" && !Array.isArray(copySetting.value)
        ? copySetting.value as Record<string, unknown>
        : {};
    const copy = Object.fromEntries((["en", "fa"] as const).map((language) => {
        const rawLanguage = rawCopy[language] && typeof rawCopy[language] === "object" && !Array.isArray(rawCopy[language])
            ? rawCopy[language] as Record<string, unknown>
            : {};
        return [language, Object.fromEntries(scrollwiseSceneKeys.map((key) => {
            const fallback = defaultScrollwiseCopy[language][key];
            const rawChapter = rawLanguage[key] && typeof rawLanguage[key] === "object" && !Array.isArray(rawLanguage[key])
                ? rawLanguage[key] as Record<string, unknown>
                : {};
            const text = (field: keyof typeof fallback) => typeof rawChapter[field] === "string" && rawChapter[field].trim()
                ? rawChapter[field].trim()
                : fallback[field];
            return [key, {
                title: text("title"),
                description: text("description"),
                interludeTitle: text("interludeTitle"),
                interludeDescription: text("interludeDescription"),
                bridge: text("bridge"),
                assistantPrompt: text("assistantPrompt"),
            }];
        }))];
    })) as ScrollwiseCopy;
    return {
        scenes,
        copy,
        display: {
            motionPreset,
            showMotionControl: rawDisplay.showMotionControl === true,
            menuMode: rawDisplay.menuMode === "classic" ? "classic" : defaultDisplay.menuMode,
            headerLogoSize: Math.round(boundedNumber(rawDisplay.headerLogoSize, defaultDisplay.headerLogoSize, 40, 64)),
            headerTitleSize: Math.round(boundedNumber(rawDisplay.headerTitleSize, defaultDisplay.headerTitleSize, 13, 22)),
            headingScale: Math.round(boundedNumber(rawDisplay.headingScale, defaultDisplay.headingScale, 90, 115)),
            veilOpacity: boundedNumber(rawDisplay.veilOpacity, defaultDisplay.veilOpacity, 0.5, 0.98),
            storyHeight: Math.round(boundedNumber(rawDisplay.storyHeight, defaultDisplay.storyHeight, 120, 220)),
            interludeHeight: Math.round(boundedNumber(rawDisplay.interludeHeight, defaultDisplay.interludeHeight, 60, 140)),
        } satisfies ScrollwiseDisplaySettings,
    };
}

export async function getScrollwiseHeaderDisplay(): Promise<Pick<ScrollwiseDisplaySettings, "showMotionControl" | "menuMode" | "headerLogoSize" | "headerTitleSize">> {
    const settings = await loadScrollwiseSettings();
    const displaySetting = settings.find((setting) => setting.key === "site.scrollwiseExperience");
    const display = displaySetting?.value && typeof displaySetting.value === "object" && !Array.isArray(displaySetting.value)
        ? displaySetting.value as Record<string, unknown>
        : {};
    return {
        showMotionControl: display.showMotionControl === true,
        menuMode: display.menuMode === "classic" ? "classic" : defaultDisplay.menuMode,
        headerLogoSize: Math.round(boundedNumber(display.headerLogoSize, defaultDisplay.headerLogoSize, 40, 64)),
        headerTitleSize: Math.round(boundedNumber(display.headerTitleSize, defaultDisplay.headerTitleSize, 13, 22)),
    };
}

function routeId(value: string): string {
    return encodeURIComponent(value);
}

export async function getScrollwiseExperience(language: "en" | "fa"): Promise<ScrollwiseExperience> {
    const [home, services, solutions, industries, projects, scrollwiseSettings] = await Promise.all([
        getPublicHomepageContent(language),
        getPublicEnterprisePage("services", language),
        getPublicEnterprisePage("solutions", language),
        getPublicEnterprisePage("industries", language),
        getPublicEnterprisePage("projects", language),
        resolveScrollwiseSettings(),
    ]);
    const fa = language === "fa";
    const serviceHighlights = services.cards.map((card) => ({
        title: card.title,
        summary: card.summary,
        href: `/services/${routeId(card.id)}?lang=${language}`,
    }));
    const solutionHighlights = solutions.catalog.cards.map((card) => ({
        title: card.title,
        summary: card.outcome,
        href: `/solutions/${routeId(card.id)}?lang=${language}`,
    }));
    const proofImages = ["v2-proof-bid-boland.webp", "v2-proof-sonqor.webp", "v2-proof-negin-zafar.webp", "v2-proof-noorin-bonyad.webp"];
    const projectHighlights = projects.section.cards.map((card, index) => ({
        title: card.title,
        summary: card.impact,
        href: `/projects/${routeId(card.id)}?lang=${language}`,
        image: `/media-generated/scrollwise/${proofImages[index] ?? proofImages[0]}`,
    }));
    const industryHighlights = industries.section.cards.map((card) => ({
        title: card.title,
        summary: card.summary,
        href: `/industries/${routeId(card.id)}?lang=${language}`,
    }));
    const serviceSet = (ids: string[]) => services.cards.flatMap((card, index) => ids.includes(card.id) ? [serviceHighlights[index]] : []);
    const solutionSet = (ids: string[]) => solutions.catalog.cards.flatMap((card, index) => ids.includes(card.id) ? [solutionHighlights[index]] : []);
    const industrySet = (ids: string[]) => industries.section.cards.flatMap((card, index) => ids.includes(card.id) ? [industryHighlights[index]] : []);

    const definitions: Array<Omit<ScrollwiseChapter, "desktopImage" | "mobileImage" | "role" | "chapterNumber" | "bridge" | "assistantPrompt">> = fa ? [
        { key: "gateway", number: "۰۱", eyebrow: "مسئله", title: "وقتی داده، فرایند و تصمیم از هم جدا می‌شوند", description: "سامانه‌های جزیره‌ای، دید محدود و فرایندهای ناپیوسته، تصمیم‌گیری و توسعه سازمان را کند می‌کنند؛ حتی وقتی فناوری در همه‌جا حضور دارد.", imageAlt: "سازمان و مجموعه صنعتی با واحدها و سامانه‌های جدا از هم", action: { label: "شروع مسیر", href: "#discover" }, highlights: [...solutionSet(["digital-foundation", "secure-modern-infrastructure"]), ...serviceSet(["digital-transformation-consulting"])], interlude: { eyebrow: "از نشانه به مسئله", title: "چالش اصلی سازمان شما کجاست؟", description: "مسیر تحول زمانی روشن می‌شود که گلوگاه واقعی میان فرایند، داده، زیرساخت و تصمیم‌گیری شناخته شود.", nextLabel: "ورود به مرحله کشف" } },
        { key: "discover", number: "۰۲", eyebrow: "کشف", title: "تحول از شناخت دقیق مسئله آغاز می‌شود", description: "با بررسی میدانی، گفت‌وگو با ذی‌نفعان و تحلیل وضعیت موجود، مسئله واقعی را از نشانه‌های آن جدا می‌کنیم.", imageAlt: "مهندسان در حال بررسی میدانی و تحلیل وضعیت یک مجموعه صنعتی", highlights: [...solutionSet(["digital-foundation", "secure-modern-infrastructure"]), ...serviceSet(["digital-transformation-consulting"])], interlude: { eyebrow: "تصویر مشترک", title: "مسئله را پیش از انتخاب فناوری تعریف می‌کنیم", description: "ارزیابی بلوغ، تحلیل فرایند و معماری وضع موجود، مبنای یک تصمیم اجرایی قابل دفاع می‌شود.", nextLabel: "طراحی نقشه تحول" } },
        { key: "design", number: "۰۳", eyebrow: "نقشه تحول", title: "معماری‌ای که فناوری را به عملیات متصل می‌کند", description: "نیاز کسب‌وکار، زیرساخت، شبکه، داده، نرم‌افزار و امنیت در یک نقشه اجرایی مرحله‌بندی‌شده کنار هم قرار می‌گیرند.", imageAlt: "طراحی نقشه راه و معماری تحول دیجیتال برای صنعت", highlights: [...serviceSet(["digital-transformation-consulting", "infrastructure-network-data-center", "cloud-modern-infrastructure"]), ...solutionSet(["digital-foundation"])], interlude: { eyebrow: "انتخاب مسیر", title: "از راهبرد به برنامه‌ای که قابل اجراست", description: "هر اقدام با اولویت، وابستگی، ریسک و نتیجه مورد انتظار به یک مسیر روشن تحویل متصل می‌شود.", nextLabel: "ساخت بنیان دیجیتال" } },
        { key: "buildSecure", number: "۰۴", eyebrow: "بنیان دیجیتال", title: "پیاده‌سازی کنترل‌شده، از ارتباطات تا پلتفرم", description: "شبکه، مرکز داده، ابر، نرم‌افزار و امنیت لایه‌ای، بستری پایدار و قابل پایش برای توسعه بعدی می‌سازند.", imageAlt: "استقرار امن ارتباطات، مرکز داده، ابر و سامانه‌های صنعتی", highlights: serviceSet(["infrastructure-network-data-center", "cloud-modern-infrastructure", "cybersecurity-business-continuity", "enterprise-solutions"]), interlude: { eyebrow: "زیرساخت آماده صنعت", title: "تحول پایدار به یک بنیان امن نیاز دارد", description: "زیرساخت باید هم‌زمان از دسترس‌پذیری، امنیت، مقیاس‌پذیری و بهره‌برداری روزمره پشتیبانی کند.", nextLabel: "ورود به نفت و گاز" } },
        { key: "oilGas", number: "۰۵", eyebrow: "نفت و گاز", title: "از میدان تا مرکز عملیات، یک جریان مطمئن اطلاعات", description: "اتصال ایمن تجهیزات، ارتباطات صنعتی و یکپارچگی IT و OT، داده عملیاتی را در زمان مناسب به تصمیم تبدیل می‌کند.", imageAlt: "میدان نفت و گاز متصل به خطوط انتقال و مرکز عملیات", highlights: [...industrySet(["energy-petrochemicals"]), ...solutionSet(["secure-modern-infrastructure"]), ...serviceSet(["infrastructure-network-data-center", "managed-it-services"])], interlude: { eyebrow: "فناوری در میدان", title: "دیدپذیری و قابلیت اتکا برای عملیات نفت و گاز", description: "ارتباطات صنعتی، پایش دارایی و امنیت عملیاتی، فاصله میان میدان و مرکز تصمیم را کوتاه می‌کنند.", nextLabel: "حرکت به پتروشیمی" } },
        { key: "petrochemical", number: "۰۶", eyebrow: "پتروشیمی", title: "کیفیت، نگهداری و تولید بر یک بستر داده", description: "داده آزمایشگاه، تجهیزات و برنامه‌ریزی تولید در یک نمای مشترک قرار می‌گیرد تا توقف، دوباره‌کاری و عدم‌قطعیت کاهش یابد.", imageAlt: "مجتمع پتروشیمی با آزمایشگاه، نگهداری و مرکز تحلیل یکپارچه", highlights: [...industrySet(["energy-petrochemicals"]), ...solutionSet(["ai-knowledge-operations"]), ...serviceSet(["ai-solutions", "managed-it-services"])], interlude: { eyebrow: "عملیات داده‌محور", title: "از کنترل کیفیت تا برنامه‌ریزی یکپارچه", description: "اطلاعات قابل اعتماد، نگهداری و تولید را به تصمیم‌های دقیق‌تر و قابل پیگیری متصل می‌کند.", nextLabel: "گسترش به اکوسیستم انرژی" } },
        { key: "connectedOperations", number: "۰۷", eyebrow: "انرژی متصل", title: "دید یکپارچه از تولید تا مدیریت منابع", description: "پایش شبکه، دارایی‌های تولید و منابع متنوع انرژی، یک تصویر عملیاتی مشترک برای هماهنگی روزمره می‌سازد.", imageAlt: "نیروگاه، شبکه برق و انرژی‌های تجدیدپذیر متصل به مرکز عملیات", highlights: [...industrySet(["energy-petrochemicals"]), ...solutionSet(["digital-foundation", "ai-knowledge-operations"]), ...serviceSet(["managed-it-services"])], interlude: { eyebrow: "عملیات متصل", title: "یک نمای مشترک برای یک اکوسیستم پیچیده", description: "داده درست، در زمان درست و برای افراد درست، هماهنگی و تاب‌آوری عملیات انرژی را ارتقا می‌دهد.", nextLabel: "افزودن لایه هوشمندی" } },
        { key: "intelligence", number: "۰۸", eyebrow: "سازمان هوشمند", title: "هوش مصنوعی در خدمت تصمیم و اجرا", description: "دوقلوی دیجیتال، تحلیل پیش‌بینانه، دستیارهای سازمانی و اتوماسیون، توان کارشناسان و مدیران را در یک چارچوب حاکمیت‌شده افزایش می‌دهند.", imageAlt: "دوقلوی دیجیتال و هوش مصنوعی تحت نظارت تیم صنعتی", highlights: [...serviceSet(["ai-solutions", "enterprise-solutions", "digital-transformation-consulting"]), ...solutionSet(["ai-knowledge-operations"])], interlude: { eyebrow: "هوشمندی مسئولانه", title: "انسان در مرکز سازمان هوشمند باقی می‌ماند", description: "هوش مصنوعی زمانی ارزش می‌سازد که داده قابل اعتماد، هدف روشن، نظارت انسانی و معیار قابل اندازه‌گیری داشته باشد.", nextLabel: "دیدن نتیجه پایدار" } },
        { key: "outcomes", number: "۰۹", eyebrow: "نتیجه پایدار", title: "چرخه‌ای که با تحویل پایان نمی‌یابد", description: "هر پروژه به یک قابلیت پایدار برای بهره‌برداری، یادگیری و مرحله بعدی رشد سازمان تبدیل می‌شود.", imageAlt: "چشم‌انداز یکپارچه صنایع، زیرساخت دیجیتال و تیم‌های هوشمند", action: { label: "گفت‌وگو درباره پروژه", href: `/contact?lang=${language}` }, highlights: projectHighlights.slice(0, 4), interlude: { eyebrow: "ادامه مسیر", title: "تحول یک مقصد نیست؛ یک قابلیت سازمانی است", description: "پروژه‌ها، خدمات و تجربه‌های صنعتی آرندی می‌توانند نقطه شروع مرحله بعدی سازمان شما باشند.", nextLabel: "گفت‌وگو با آرندی" } },
    ] : [
        { key: "gateway", number: "01", eyebrow: "The problem", title: "When data, processes and decisions drift apart", description: "Siloed systems, limited visibility and disconnected workflows slow decisions and growth—even when technology is present everywhere.", imageAlt: "Organization and industrial estate with disconnected teams and systems", action: { label: "Begin the journey", href: "#discover" }, highlights: [...solutionSet(["digital-foundation", "secure-modern-infrastructure"]), ...serviceSet(["digital-transformation-consulting"])], interlude: { eyebrow: "From symptom to problem", title: "Where is your organization's real constraint?", description: "The transformation path becomes clear when the bottleneck between process, data, infrastructure and decisions is understood.", nextLabel: "Enter discovery" } },
        { key: "discover", number: "02", eyebrow: "Discover", title: "Transformation begins with a precise understanding", description: "Field observation, stakeholder dialogue and current-state analysis separate the real operating problem from its symptoms.", imageAlt: "Engineers surveying and diagnosing an industrial operation", highlights: [...solutionSet(["digital-foundation", "secure-modern-infrastructure"]), ...serviceSet(["digital-transformation-consulting"])], interlude: { eyebrow: "A shared picture", title: "Define the problem before choosing technology", description: "Maturity assessment, process analysis and current-state architecture create a defensible basis for action.", nextLabel: "Design the transformation" } },
        { key: "design", number: "03", eyebrow: "Transformation roadmap", title: "Architecture that connects technology to operations", description: "Business needs, infrastructure, networks, data, software and security become one coherent, phased delivery blueprint.", imageAlt: "Digital-transformation roadmap and architecture for industry", highlights: [...serviceSet(["digital-transformation-consulting", "infrastructure-network-data-center", "cloud-modern-infrastructure"]), ...solutionSet(["digital-foundation"])], interlude: { eyebrow: "Choose the path", title: "From strategy to an executable program", description: "Every action is connected to priorities, dependencies, risk and an expected operational outcome.", nextLabel: "Build the digital foundation" } },
        { key: "buildSecure", number: "04", eyebrow: "Digital foundation", title: "Controlled delivery, from communications to platform", description: "Networks, data centers, cloud, software and layered security create a resilient, observable foundation for the next stage.", imageAlt: "Secure industrial communications, data center, cloud and software deployment", highlights: serviceSet(["infrastructure-network-data-center", "cloud-modern-infrastructure", "cybersecurity-business-continuity", "enterprise-solutions"]), interlude: { eyebrow: "Industry-ready infrastructure", title: "Durable transformation needs a secure foundation", description: "The platform must support availability, security, scale and everyday operations at the same time.", nextLabel: "Enter oil and gas" } },
        { key: "oilGas", number: "05", eyebrow: "Oil & gas", title: "One trusted information flow from field to operations", description: "Secure instrumentation, industrial communications and IT/OT integration turn field data into timely operational decisions.", imageAlt: "Oil and gas field connected through pipelines to an operations center", highlights: [...industrySet(["energy-petrochemicals"]), ...solutionSet(["secure-modern-infrastructure"]), ...serviceSet(["infrastructure-network-data-center", "managed-it-services"])], interlude: { eyebrow: "Technology in the field", title: "Visibility and reliability for oil and gas operations", description: "Industrial communications, asset monitoring and operational security reduce the distance between field and decision center.", nextLabel: "Continue to petrochemicals" } },
        { key: "petrochemical", number: "06", eyebrow: "Petrochemicals", title: "Quality, maintenance and production on one data foundation", description: "Laboratory, asset and production-planning data form a shared view that reduces downtime, rework and uncertainty.", imageAlt: "Petrochemical complex with integrated laboratory, maintenance and analytics", highlights: [...industrySet(["energy-petrochemicals"]), ...solutionSet(["ai-knowledge-operations"]), ...serviceSet(["ai-solutions", "managed-it-services"])], interlude: { eyebrow: "Data-driven operations", title: "From quality control to integrated planning", description: "Trusted information connects maintenance and production with decisions that are more precise and traceable.", nextLabel: "Expand into energy" } },
        { key: "connectedOperations", number: "07", eyebrow: "Connected energy", title: "One operating view from generation to resource management", description: "Grid monitoring, generation assets and diverse energy resources form a common operational picture for everyday coordination.", imageAlt: "Power generation, grid and renewable energy connected to an operations center", highlights: [...industrySet(["energy-petrochemicals"]), ...solutionSet(["digital-foundation", "ai-knowledge-operations"]), ...serviceSet(["managed-it-services"])], interlude: { eyebrow: "Connected operations", title: "A shared view for a complex ecosystem", description: "The right data, at the right time, for the right people improves coordination and operational resilience.", nextLabel: "Add intelligence" } },
        { key: "intelligence", number: "08", eyebrow: "Intelligent enterprise", title: "AI in service of decisions and delivery", description: "Digital twins, predictive insight, enterprise assistants and automation extend expert capability within a governed operating model.", imageAlt: "Human-led digital twin and artificial intelligence in industrial operations", highlights: [...serviceSet(["ai-solutions", "enterprise-solutions", "digital-transformation-consulting"]), ...solutionSet(["ai-knowledge-operations"])], interlude: { eyebrow: "Responsible intelligence", title: "People remain at the center of the intelligent enterprise", description: "AI creates value when it has trusted data, a clear purpose, human oversight and measurable outcomes.", nextLabel: "See the durable outcome" } },
        { key: "outcomes", number: "09", eyebrow: "Durable outcomes", title: "A lifecycle that continues beyond handover", description: "Each project becomes a lasting capability for operations, learning and the organization's next stage of growth.", imageAlt: "Integrated industry, digital infrastructure and intelligent teams", action: { label: "Discuss a project", href: `/contact?lang=${language}` }, highlights: projectHighlights.slice(0, 4), interlude: { eyebrow: "Continue the journey", title: "Transformation is a capability, not a destination", description: "Arandi's projects, services and industry experience can become the starting point for your next stage.", nextLabel: "Talk to Arandi" } },
    ];

    definitions.push(fa
        ? { key: "finale", number: "", eyebrow: "ادامه مسیر", title: "تحول یک پروژه نیست؛ قابلیتی است که باقی می‌ماند", description: "تصویر آغازین اکنون کامل است و پایان این روایت، نقطه آغاز گفت‌وگوی تحول سازمان شماست.", imageAlt: "تصویر کامل و متصل میدان، کارخانه، مرکز داده و اتاق تصمیم", action: { label: "آغاز گفت‌وگوی تحول", href: `/contact?lang=${language}` }, highlights: [], interlude: { eyebrow: "بازگشت به تصویر کامل", title: "از یک گسست کوچک، تا یک تصویر کامل", description: "مسیر بعدی را با یک گفت‌وگوی روشن آغاز کنیم.", nextLabel: "آغاز گفت‌وگو" } }
        : { key: "finale", number: "", eyebrow: "Continue the path", title: "Transformation is not a project; it is a capability that remains", description: "The opening picture is now complete, and the end of this story begins your transformation conversation.", imageAlt: "Complete connected picture of field, plant, data center and decision room", action: { label: "Start a transformation conversation", href: `/contact?lang=${language}` }, highlights: [], interlude: { eyebrow: "Return to the complete picture", title: "From a small disconnect to the complete picture", description: "Begin the next path with a clear conversation.", nextLabel: "Begin the conversation" } });

    const chapterMeta: Record<ScrollwiseSceneKey, { role: ScrollwiseChapter["role"]; chapterNumber?: string; eyebrow: string }> = fa ? {
        gateway: { role: "prelude", eyebrow: "پیش‌درآمد · گسست" },
        discover: { role: "chapter", chapterNumber: "۰۱", eyebrow: "دیدن" },
        design: { role: "chapter", chapterNumber: "۰۲", eyebrow: "طراحی مسیر" },
        buildSecure: { role: "chapter", chapterNumber: "۰۳", eyebrow: "ساختن بنیان" },
        oilGas: { role: "chapter", chapterNumber: "۰۴", eyebrow: "فناوری در میدان · اپیزود ۱" },
        petrochemical: { role: "episode", eyebrow: "فناوری در میدان · اپیزود ۲" },
        connectedOperations: { role: "episode", eyebrow: "فناوری در میدان · اپیزود ۳" },
        intelligence: { role: "chapter", chapterNumber: "۰۵", eyebrow: "هوشمندی" },
        outcomes: { role: "chapter", chapterNumber: "۰۶", eyebrow: "اثبات" },
        finale: { role: "finale", eyebrow: "پایان · تصویر کامل" },
    } : {
        gateway: { role: "prelude", eyebrow: "Prelude · The disconnect" },
        discover: { role: "chapter", chapterNumber: "01", eyebrow: "Seeing" },
        design: { role: "chapter", chapterNumber: "02", eyebrow: "Designing the path" },
        buildSecure: { role: "chapter", chapterNumber: "03", eyebrow: "Building the foundation" },
        oilGas: { role: "chapter", chapterNumber: "04", eyebrow: "Technology in the field · Episode 1" },
        petrochemical: { role: "episode", eyebrow: "Technology in the field · Episode 2" },
        connectedOperations: { role: "episode", eyebrow: "Technology in the field · Episode 3" },
        intelligence: { role: "chapter", chapterNumber: "05", eyebrow: "Intelligence" },
        outcomes: { role: "chapter", chapterNumber: "06", eyebrow: "Proof" },
        finale: { role: "finale", eyebrow: "Finale · The complete picture" },
    };

    return {
        language,
        intro: home.hero.content,
        chapters: definitions.map((chapter) => {
            const copy = scrollwiseSettings.copy[language][chapter.key];
            const meta = chapterMeta[chapter.key];
            return {
                ...chapter,
                ...scrollwiseSettings.scenes[chapter.key],
                ...meta,
                number: meta.chapterNumber ?? "",
                title: copy.title,
                description: copy.description,
                bridge: copy.bridge,
                assistantPrompt: copy.assistantPrompt,
                interlude: {
                    ...chapter.interlude,
                    title: copy.interludeTitle,
                    description: copy.interludeDescription,
                },
            };
        }),
        metrics: { projects: projects.section.cards.length, services: services.cards.length, industries: industries.section.cards.length },
        display: scrollwiseSettings.display,
    };
}
