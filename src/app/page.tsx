import { Fragment } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChatInterface } from "@/components/ai/ChatInterface";
import { Features } from "@/components/sections/Features";
import { Hero } from "@/components/sections/Hero";
import type { EditableHomepageSection } from "@/content";
import { buildLocalizedMetadata } from "@/lib/pageMetadata";
import { getPublicHomepageContent } from "@/lib/public-content";

type PageProps = {
  searchParams?: Promise<{ lang?: string }> | { lang?: string };
};

async function resolvePageLanguage(searchParams: PageProps["searchParams"]) {
  const params = await Promise.resolve(searchParams);
  return params?.lang === "fa" ? "fa" as const : "en" as const;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const lang = await resolvePageLanguage(searchParams);
  try {
    const content = await getPublicHomepageContent(lang);
    return buildLocalizedMetadata({
      path: "/",
      lang,
      title: content.metadata.title,
      description: content.metadata.description,
      keywords: content.metadata.keywords,
    });
  } catch {
    return {
      title: lang === "fa" ? "محتوا در دسترس نیست" : "Content unavailable",
      robots: { index: false, follow: false },
    };
  }
}

export default async function Home({ searchParams }: PageProps) {
  const lang = await resolvePageLanguage(searchParams);
  const pageContent = await getPublicHomepageContent(lang).catch(() => notFound());

  const visibleSections = [
    { section: pageContent.hero, node: <Hero content={pageContent.hero.content} lang={pageContent.language} /> },
    { section: pageContent.chat, node: <ChatInterface content={pageContent.chat.content} lang={pageContent.language} /> },
    { section: pageContent.features, node: <Features content={pageContent.features.content} lang={pageContent.language} /> },
  ]
    .filter(({ section }: { section: EditableHomepageSection }) => section.visibility.enabled !== false)
    .sort((first, second) => first.section.order - second.section.order);

  return (
    <div
      className="flex flex-1 flex-col"
      data-content-source={pageContent.hero.cms.source}
      dir={pageContent.language === "fa" ? "rtl" : "ltr"}
      lang={pageContent.language}
    >
      {visibleSections.map(({ section, node }) => (
        <Fragment key={section.id}>{node}</Fragment>
      ))}
    </div>
  );
}
