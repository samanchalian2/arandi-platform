import type { Metadata } from "next";
import { Exo, Vazirmatn } from "next/font/google";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { AppChrome } from "@/components/layout/AppChrome";
import { DirectionProvider } from "@/components/layout/DirectionProvider";
import { getSiteOrigin } from "@/lib/pageMetadata";
import { getPublicChromeContent, getPublicTheme, getScrollwiseHeaderDisplay, THEME_PREVIEW_COOKIE } from "@/lib/public-content";
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

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  applicationName: "Arandi Platform",
  title: "Arandi Bonyan",
  icons: {
    icon: "/brand/arandi-symbol.png",
    apple: "/brand/arandi-symbol.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  const lang = "en" as const;
  const cookieStore = await cookies();
  const [englishContent, persianContent, publicTheme, scrollwiseHeaderDisplay] = await Promise.all([
    getPublicChromeContent("en"),
    getPublicChromeContent("fa"),
    getPublicTheme(cookieStore.get(THEME_PREVIEW_COOKIE)?.value),
    getScrollwiseHeaderDisplay(),
  ]);
  const organizationJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: englishContent.company.name,
    alternateName: persianContent.company.name,
    url: getSiteOrigin(),
    logo: `${getSiteOrigin()}/brand/arandi-lockup.png`,
  }).replace(/</g, "\\u003c");

  return (
    <html
      lang="en"
      dir="ltr"
      data-scroll-behavior="smooth"
      className={`${exo.variable} ${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
        />
        <Suspense fallback={null}>
          <DirectionProvider />
        </Suspense>
        <Suspense fallback={null}>
          <AppChrome
            contentByLanguage={{
              en: {
                navigation: englishContent.navigation,
                company: englishContent.company,
                footer: englishContent.footer,
              },
              fa: {
                navigation: persianContent.navigation,
                company: persianContent.company,
                footer: persianContent.footer,
              },
            }}
            lang={lang}
            publicTheme={publicTheme}
            scrollwiseShowMotionControl={scrollwiseHeaderDisplay.showMotionControl}
            scrollwiseMenuMode={scrollwiseHeaderDisplay.menuMode}
            scrollwiseHeaderLogoSize={scrollwiseHeaderDisplay.headerLogoSize}
            scrollwiseHeaderTitleSize={scrollwiseHeaderDisplay.headerTitleSize}
          >
            {children}
          </AppChrome>
        </Suspense>
      </body>
    </html>
  );
}
