import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PublicContentHub } from "../src/components/page/PublicDocumentViews";
import type { PublicDocumentSummary } from "../src/lib/public-content/documents";

const article: PublicDocumentSummary = {
    slug: "ai-readiness",
    route: "/articles/ai-readiness",
    type: "article",
    title: "Article title",
    description: "Article description",
};
const guide: PublicDocumentSummary = {
    slug: "operations-guide",
    route: "/knowledge/operations-guide",
    type: "knowledge",
    title: "Guide title",
    description: "Guide description",
};

test("Persian hub groups articles and guides and exposes Jupiter exactly once", () => {
    const html = renderToStaticMarkup(createElement(PublicContentHub, {
        lang: "fa",
        articles: [article],
        guides: [guide, { ...guide, slug: "jupiter-guide", route: "/knowledge/jupiter-guide" }],
    }));
    assert.match(html, /id="hub-articles"/);
    assert.match(html, /id="hub-guides"/);
    assert.match(html, /href="\/articles\/ai-readiness\?lang=fa"/);
    assert.match(html, /href="\/knowledge\/operations-guide\?lang=fa"/);
    assert.equal((html.match(/href="\/knowledge\/jupiter-guide\?lang=fa"/g) ?? []).length, 1);
    assert.match(html, /مقالات و راهنماها/);
});

test("English hub shows English CMS guides without an unreviewed Jupiter card", () => {
    const html = renderToStaticMarkup(createElement(PublicContentHub, {
        lang: "en",
        articles: [article],
        guides: [guide],
    }));
    assert.match(html, /Articles and guides/);
    assert.match(html, /href="\/knowledge\/operations-guide\?lang=en"/);
    assert.doesNotMatch(html, /jupiter-guide/);
});
