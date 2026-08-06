import type { MetadataRoute } from "next";

import { getSiteOrigin } from "@/lib/pageMetadata";

export default function robots(): MetadataRoute.Robots {
    const origin = getSiteOrigin();
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/admin",
                "/api",
                "/account",
                "/recover",
                "/search",
            ],
        },
        sitemap: `${origin}/sitemap.xml`,
        host: origin,
    };
}
