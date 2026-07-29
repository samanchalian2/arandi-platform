import type { Metadata } from "next";
import { Exo, Vazirmatn } from "next/font/google";
import { Suspense } from "react";
import { DirectionProvider } from "@/components/layout/DirectionProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { contentProvider } from "@/content";
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
  const metadata = contentProvider.getMetadata(params?.lang);

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
  // Note: layouts never actually receive `searchParams` from Next.js (only
  // pages do), so this always resolves to the "en" fallback here. It is only
  // used as a default for content that is resolved before the client can read
  // the real `?lang=` query value. `Header` reads the live value itself via
  // `useSearchParams()` so it always reflects the actual requested language.
  const params = await Promise.resolve(searchParams);
  const lang = params?.lang === "fa" ? "fa" : "en";
  const pageContent = contentProvider.getPageContent(lang);

  return (
    <html
      lang={lang}
      dir={lang === "fa" ? "rtl" : "ltr"}
      className={`${exo.variable} ${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Suspense fallback={null}>
          <DirectionProvider />
        </Suspense>
        <div className="flex min-h-screen flex-col">
          <Suspense fallback={null}>
            <Header content={pageContent.navigation} company={pageContent.company} lang={lang} />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer content={pageContent.footer} company={pageContent.company} />
        </div>
      </body>
    </html>
  );
}
