import type { Metadata } from "next";
import { Exo, Vazirmatn } from "next/font/google";
import { Suspense } from "react";
import { DirectionProvider } from "@/components/layout/DirectionProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCompanyContent, getFooterContent, getMetadataContent, getNavigationContent } from "@/content";
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
  const lang = params?.lang === "fa" ? "fa" : "en";
  const navigationContent = getNavigationContent(lang);
  const footerContent = getFooterContent(lang);
  const companyContent = getCompanyContent(lang);

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
          <Header content={navigationContent} company={companyContent} />
          <main className="flex-1">{children}</main>
          <Footer content={footerContent} company={companyContent} />
        </div>
      </body>
    </html>
  );
}
