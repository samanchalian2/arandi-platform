import { prisma } from "@/lib/prisma";

export type AIContextCitation = {
  id: string;
  label: string;
  href: string;
};

export type PublishedAIContext = {
  text: string;
  citations: AIContextCitation[];
};

type ContextPage = Awaited<ReturnType<typeof findPublishedAIContextSnapshot>>[number];

const MAX_SOURCES = 8;
const MAX_CONTEXT_CHARACTERS = 12_000;

export async function findPublishedAIContextSnapshot(locale: "en" | "fa") {
  return prisma.page.findMany({
    where: {
      publishState: "published",
      translations: { some: { languageCode: locale } },
    },
    orderBy: [{ updatedAt: "desc" }, { slug: "asc" }],
    include: {
      translations: { where: { languageCode: locale } },
      sections: {
        where: { enabled: true },
        orderBy: [{ order: "asc" }, { id: "asc" }],
        include: {
          translations: { where: { languageCode: locale } },
          cards: {
            where: { publishState: "published" },
            orderBy: [{ order: "asc" }, { id: "asc" }],
            include: { translations: { where: { languageCode: locale } } },
          },
        },
      },
    },
  });
}

function normalizedTerms(query: string, locale: "en" | "fa"): string[] {
  const normalized = query
    .normalize("NFKC")
    .toLocaleLowerCase(locale)
    .replace(/[^\p{L}\p{N}]+/gu, " ");
  return [...new Set(normalized.split(/\s+/).filter((term) => term.length >= 2))].slice(0, 24);
}

function pageText(page: ContextPage): string {
  const translation = page.translations[0];
  return [
    translation?.title,
    translation?.seoTitle,
    translation?.seoDescription,
    ...page.seoKeywords,
    ...page.sections.flatMap((section) => {
      const value = section.translations[0];
      return [
        value?.title,
        value?.subtitle,
        value?.description,
        ...section.cards.flatMap((card) => {
          const cardValue = card.translations[0];
          return [cardValue?.title, cardValue?.subtitle, cardValue?.description];
        }),
      ];
    }),
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join("\n");
}

export function mapPublishedAIContext(
  pages: ContextPage[],
  query: string,
  locale: "en" | "fa",
): PublishedAIContext {
  const terms = normalizedTerms(query, locale);
  if (terms.length === 0) return { text: "", citations: [] };

  const ranked = pages.flatMap((page) => {
    const translation = page.translations[0];
    if (!translation || !page.route.startsWith("/") || page.route.startsWith("//")) return [];
    const content = pageText(page);
    const lower = content.toLocaleLowerCase(locale);
    const title = translation.title.toLocaleLowerCase(locale);
    const score = terms.reduce(
      (total, term) => total + (title.includes(term) ? 5 : 0) + (lower.includes(term) ? 1 : 0),
      0,
    );
    return score > 0 ? [{ page, translation, content, score }] : [];
  }).sort((a, b) => b.score - a.score).slice(0, MAX_SOURCES);

  const citations: AIContextCitation[] = [];
  const blocks: string[] = [];
  let length = 0;
  for (const item of ranked) {
    const id = String(citations.length + 1);
    const block = `[${id}] ${item.translation.title}\nURL: ${item.page.route}\n${item.content}`;
    const remaining = MAX_CONTEXT_CHARACTERS - length;
    if (remaining < 200) break;
    blocks.push(block.slice(0, remaining));
    length += Math.min(block.length, remaining);
    citations.push({
      id,
      label: item.translation.title,
      href: `${item.page.route}?lang=${locale}`,
    });
  }
  return { text: blocks.join("\n\n---\n\n"), citations };
}

export async function getPublishedAIContext(
  query: string,
  locale: "en" | "fa",
): Promise<PublishedAIContext> {
  return mapPublishedAIContext(await findPublishedAIContextSnapshot(locale), query, locale);
}
