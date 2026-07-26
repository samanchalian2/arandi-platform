import { ChatInterface } from "@/components/ai/ChatInterface";
import { Features } from "@/components/sections/Features";
import { Hero } from "@/components/sections/Hero";
import { getChatContent, getFeatureContent, getHeroContent } from "@/content";

type PageProps = {
  searchParams?: Promise<{ lang?: string }> | { lang?: string };
};

export default async function Home({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams);
  const lang = params?.lang === "fa" ? "fa" : "en";

  const heroContent = getHeroContent(lang);
  const chatContent = getChatContent(lang);
  const featureContent = getFeatureContent(lang);

  return (
    <div className="flex flex-1 flex-col" dir={lang === "fa" ? "rtl" : "ltr"} lang={lang}>
      <Hero content={heroContent} lang={lang} />
      <ChatInterface content={chatContent} lang={lang} />
      <Features content={featureContent} lang={lang} />
    </div>
  );
}
