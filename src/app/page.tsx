import { ChatInterface } from "@/components/ai/ChatInterface";
import { Features } from "@/components/sections/Features";
import { Hero } from "@/components/sections/Hero";
import { getSiteContent } from "@/content/siteContent";

type PageProps = {
  searchParams?: Promise<{ lang?: string }> | { lang?: string };
};

export default async function Home({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams);
  const content = getSiteContent(params?.lang);

  return (
    <div className="flex flex-1 flex-col" dir={content.language === "fa" ? "rtl" : "ltr"} lang={content.language}>
      <Hero content={content.hero} lang={content.language} />
      <ChatInterface content={content.chat} lang={content.language} />
      <Features content={content.features} lang={content.language} />
    </div>
  );
}
