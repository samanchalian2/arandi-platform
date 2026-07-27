import { Fragment } from "react";

import { ChatInterface } from "@/components/ai/ChatInterface";
import { Features } from "@/components/sections/Features";
import { Hero } from "@/components/sections/Hero";
import { contentProvider } from "@/content";
import type { EditableHomepageSection } from "@/content";

type PageProps = {
  searchParams?: Promise<{ lang?: string }> | { lang?: string };
};

export default async function Home({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams);
  const lang = params?.lang === "fa" ? "fa" : "en";

  const pageContent = contentProvider.getPageContent(lang);

  const visibleSections = [
    { section: pageContent.hero, node: <Hero content={pageContent.hero.content} lang={pageContent.language} /> },
    { section: pageContent.chat, node: <ChatInterface content={pageContent.chat.content} lang={pageContent.language} /> },
    { section: pageContent.features, node: <Features content={pageContent.features.content} lang={pageContent.language} /> },
  ]
    .filter(({ section }: { section: EditableHomepageSection }) => section.visibility.enabled !== false)
    .sort((first, second) => first.section.order - second.section.order);

  return (
    <div className="flex flex-1 flex-col" dir={pageContent.language === "fa" ? "rtl" : "ltr"} lang={pageContent.language}>
      {visibleSections.map(({ section, node }) => (
        <Fragment key={section.id}>{node}</Fragment>
      ))}
    </div>
  );
}
