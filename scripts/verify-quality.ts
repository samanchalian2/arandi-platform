import AxeBuilder from "@axe-core/playwright";
import { chromium, type Page } from "@playwright/test";

const baseUrl = new URL(process.env.ARANDI_QA_BASE_URL?.trim() || "http://127.0.0.1:3010");
const routes = [
    "/?lang=en",
    "/?lang=fa",
    "/services?lang=en",
    "/services?lang=fa",
    "/articles?lang=en",
    "/articles?lang=fa",
    "/contact?lang=en",
    "/contact?lang=fa",
];
const viewports = [
    { name: "mobile", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1280, height: 900 },
] as const;

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(message);
}

async function assertSeo(page: Page, route: string) {
    const expectedLanguage = route.includes("lang=fa") ? "fa" : "en";
    const snapshot = await page.evaluate(() => ({
        language: document.documentElement.lang,
        direction: document.documentElement.dir,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
        alternates: Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'))
            .map((node) => ({
                language: node.getAttribute("hreflang"),
                href: node.getAttribute("href"),
            })),
        mainCount: document.querySelectorAll("main").length,
        h1Count: document.querySelectorAll("h1").length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        organizationJsonLd: Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
            .some((node) => node.textContent?.includes('"Organization"')),
    }));
    assert(snapshot.language === expectedLanguage, `${route} html language is ${snapshot.language}.`);
    assert(snapshot.direction === (expectedLanguage === "fa" ? "rtl" : "ltr"), `${route} direction is invalid.`);
    assert(snapshot.title.length > 3, `${route} title is missing.`);
    assert((snapshot.description?.length ?? 0) > 20, `${route} description is missing.`);
    assert(snapshot.canonical?.includes(`lang=${expectedLanguage}`), `${route} canonical is invalid.`);
    assert(snapshot.alternates.some((item) => item.language === "en"), `${route} English alternate is missing.`);
    assert(snapshot.alternates.some((item) => item.language === "fa"), `${route} Persian alternate is missing.`);
    assert(snapshot.mainCount === 1, `${route} must contain one main landmark.`);
    assert(snapshot.h1Count === 1, `${route} must contain one h1.`);
    assert(snapshot.overflow <= 1, `${route} has horizontal overflow.`);
    assert(snapshot.organizationJsonLd, `${route} Organization JSON-LD is missing.`);
}

async function assertPerformance(page: Page, route: string) {
    const timing = await page.evaluate(() => {
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
        return {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
            load: navigation.loadEventEnd - navigation.startTime,
            transferBytes: resources.reduce((total, resource) => total + resource.transferSize, 0),
        };
    });
    assert(timing.domContentLoaded < 3_000, `${route} DOMContentLoaded exceeded 3 seconds.`);
    assert(timing.load < 5_000, `${route} load exceeded 5 seconds.`);
    assert(timing.transferBytes < 2_500_000, `${route} transferred more than 2.5 MB.`);
    return timing;
}

async function main() {
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const results: Array<Record<string, unknown>> = [];
    try {
        const live = await fetch(new URL("/api/health/live", baseUrl));
        const ready = await fetch(new URL("/api/health/ready", baseUrl));
        assert(live.status === 200 && ready.status === 200, "Health probes are not ready.");
        assert(live.headers.get("cache-control") === "no-store", "Liveness must not be cached.");

        const robots = await fetch(new URL("/robots.txt", baseUrl)).then((response) => response.text());
        assert(robots.includes("Disallow: /admin"), "robots.txt does not block Admin.");
        assert(robots.includes("Disallow: /api"), "robots.txt does not block APIs.");
        assert(robots.includes("Sitemap:"), "robots.txt does not advertise a sitemap.");

        const sitemap = await fetch(new URL("/sitemap.xml", baseUrl)).then((response) => response.text());
        assert(sitemap.includes("hreflang=\"en\""), "Sitemap English alternate is missing.");
        assert(sitemap.includes("hreflang=\"fa\""), "Sitemap Persian alternate is missing.");
        assert(!sitemap.includes("/admin"), "Sitemap exposes an Admin route.");

        for (const viewport of viewports) {
            const context = await browser.newContext({
                viewport,
                bypassCSP: true,
                reducedMotion: "reduce",
            });
            try {
                for (const route of routes) {
                    const page = await context.newPage();
                    const consoleErrors: string[] = [];
                    page.on("console", (message) => {
                        if (message.type() === "error") consoleErrors.push(message.text());
                    });
                    const response = await page.goto(new URL(route, baseUrl).toString(), {
                        waitUntil: "networkidle",
                        timeout: 15_000,
                    });
                    assert(response?.status() === 200, `${route} returned ${response?.status()}.`);
                    assert(response.headers()["content-security-policy"], `${route} CSP is missing.`);
                    assert(!response.headers()["x-powered-by"], `${route} exposes X-Powered-By.`);
                    await assertSeo(page, route);
                    const accessibility = await new AxeBuilder({ page })
                        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
                        .analyze();
                    const serious = accessibility.violations.filter(
                        (violation) => violation.impact === "serious" || violation.impact === "critical",
                    );
                    assert(
                        serious.length === 0,
                        `${route} has serious accessibility violations: ${serious.map((item) => item.id).join(", ")}`,
                    );
                    const performance = await assertPerformance(page, route);
                    assert(consoleErrors.length === 0, `${route} logged browser errors: ${consoleErrors.join(" | ")}`);
                    results.push({
                        viewport: viewport.name,
                        route,
                        accessibilityViolations: accessibility.violations.length,
                        ...performance,
                    });
                    await page.close();
                }
            } finally {
                await context.close();
            }
        }
    } finally {
        await browser.close();
    }
    console.log(JSON.stringify({ ok: true, baseUrl: baseUrl.origin, checks: results }, null, 2));
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Quality verifier failed.");
    process.exitCode = 1;
});
