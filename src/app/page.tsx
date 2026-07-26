import { ChatInterface } from "@/components/ai/ChatInterface";
import { Features } from "@/components/sections/Features";
import { Hero } from "@/components/sections/Hero";
import { contentProvider } from "@/content";

type PageProps = {
  searchParams?: Promise<{ lang?: string }> | { lang?: string };
};

export default async function Home({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams);
  const lang = params?.lang === "fa" ? "fa" : "en";

  const pageContent = contentProvider.getPageContent(lang);

  return (
    <div className="flex flex-1 flex-col" dir={pageContent.language === "fa" ? "rtl" : "ltr"} lang={pageContent.language}>
      <Hero content={pageContent.hero} lang={pageContent.language} />
      <ChatInterface content={pageContent.chat} lang={pageContent.language} />
      <Features content={pageContent.features} lang={pageContent.language} />
    </div>
  );
}
