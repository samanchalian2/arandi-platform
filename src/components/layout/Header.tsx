"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/components/layout/Container";
import { buildEnterpriseNavigationItems, getLocalizedHomeLabel } from "@/content/navigation";
import { cn } from "@/lib/utils";

type NavigationContent = {
  links: {
    overview: string;
    capabilities: string;
    contact: string;
  };
  enterpriseLinks: {
    company: string;
    services: string;
    solutions: string;
    industries: string;
    projects: string;
    contact: string;
  };
  languageSwitch: {
    en: string;
    fa: string;
  };
};

type CompanyContent = {
  name: string;
  shortName: string;
};

type HeaderProps = {
  content: NavigationContent;
  company: CompanyContent;
  lang: "en" | "fa";
};

export function Header({ content, company, lang }: HeaderProps) {
  const pathname = usePathname();
  const localizedHomeLabel = getLocalizedHomeLabel(lang);

  const navigationItems = buildEnterpriseNavigationItems(content.enterpriseLinks, lang);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <Container className="header-shell flex h-16 items-center justify-between gap-4">
        <Link
          href={`/?lang=${lang}`}
          className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground"
          aria-label={`${company.name} ${localizedHomeLabel}`}
        >
          {company.shortName}
        </Link>

        <div className="header-actions flex items-center gap-2">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-current={pathname === item.path ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 transition-colors hover:bg-muted hover:text-foreground",
                  pathname === item.path && "bg-muted text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ms-2 flex items-center rounded-full border border-border/70 bg-background/90 p-1 text-xs font-medium text-muted-foreground">
            <Link href="/?lang=en" className="rounded-full px-2.5 py-1.5 transition-colors hover:bg-muted hover:text-foreground">
              {content.languageSwitch.en}
            </Link>
            <Link href="/?lang=fa" className="rounded-full px-2.5 py-1.5 transition-colors hover:bg-muted hover:text-foreground">
              {content.languageSwitch.fa}
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
