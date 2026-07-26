import type { Metadata } from "next";
import { Exo, Vazirmatn } from "next/font/google";
import { Suspense } from "react";
import { DirectionProvider } from "@/components/layout/DirectionProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getMetadataContent } from "@/content/metadata";
import { getSiteContent } from "@/content/siteContent";
import "./globals.css";

const exo = Exo({
  variable: "--font-exo",
  subsets: ["latin"],
  display: "swap",
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }> | { lang?: string };
}): Promise<Metadata> {
  const params = await Promise.resolve(searchParams);
  const metadata = getMetadataContent(params?.lang);

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
  };
}

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
  searchParams?: Promise<{ lang?: string }> | { lang?: string };
}>;

export default async function RootLayout({ children, searchParams }: RootLayoutProps) {
  const params = await Promise.resolve(searchParams);
  const content = getSiteContent(params?.lang);

  return (
    <html
      lang={content.language}
      dir={content.language === "fa" ? "rtl" : "ltr"}
      className={`${exo.variable} ${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Suspense fallback={null}>
          <DirectionProvider />
        </Suspense>
        <div className="flex min-h-screen flex-col">
          <Header content={content.header} lang={content.language} />
          <main className="flex-1">{children}</main>
          <Footer content={content.footer} lang={content.language} />
        </div>
      </body>
    </html>
  );
}
