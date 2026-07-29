"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Globe2,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";

import { Container } from "@/components/layout/Container";
import { buildEnterpriseNavigationItems, getLocalizedHomeLabel, getNavigationContent } from "@/content/navigation";
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

type Language = "en" | "fa";

const emptySubscribe = () => () => { };

function normalizeLanguage(value: string | null | undefined, fallback: Language): Language {
  return value === "fa" ? "fa" : fallback === "fa" ? "fa" : "en";
}

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export function Header({ content, company, lang }: HeaderProps) {
  const pathname = usePathname();
  const isMounted = useIsMounted();
  const searchParams = useSearchParams();
  const currentLang = normalizeLanguage(searchParams.get("lang"), lang);
  const localizedContent = currentLang === lang ? content : getNavigationContent(currentLang);
  const localizedHomeLabel = getLocalizedHomeLabel(currentLang);
  const brandDisplayName = currentLang === "fa" ? "آرن دی بنیان" : company.shortName;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuPanelRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  const navigationItems = buildEnterpriseNavigationItems(localizedContent.enterpriseLinks, currentLang);
  const buildLanguageHref = (nextLang: "en" | "fa") => `${pathname || "/"}?lang=${nextLang}`;
  const isRtl = currentLang === "fa";

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const menuElement = mobileMenuPanelRef.current;
    if (!menuElement) {
      return;
    }

    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const getFocusableElements = () =>
      Array.from(menuElement.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => !element.hasAttribute("disabled"),
      );

    const initialFocusable = getFocusableElements();
    initialFocusable[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const menuButtonLabel = currentLang === "fa" ? "باز کردن منو" : "Open menu";
  const closeButtonLabel = currentLang === "fa" ? "بستن منو" : "Close menu";
  const mobileMenuTitle = currentLang === "fa" ? "ناوبری" : "Navigation";
  const mobileMenuSubtitle = currentLang === "fa"
    ? "میانبر ورود به بخش های اصلی"
    : "Quick access to core sections";

  return (
    <header
      className={cn(
        "ds-glass sticky top-0 z-[var(--z-header)] border-b border-border/70 backdrop-blur-xl transition-[box-shadow,background-color,border-color] duration-[var(--duration-base)] ease-[var(--ease-standard)]",
        isScrolled
          ? "shadow-[var(--elevation-2)] bg-background/82"
          : "shadow-[var(--elevation-1)] bg-background/72",
      )}
    >
      <Container className="grid h-18 grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
        <Link
          href={`/?lang=${currentLang}`}
          className={cn(
            "ds-focus-visible inline-flex min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-foreground",
            isRtl ? "col-start-1 row-start-1 justify-self-end flex-row-reverse text-right" : "col-start-1 row-start-1 justify-self-start text-left",
          )}
          aria-label={`${brandDisplayName} ${localizedHomeLabel}`}
        >
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/80 shadow-[var(--elevation-1)]"
          >
            <svg viewBox="0 0 24 24" className="size-5 text-muted-foreground/70" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="4.5" y="4.5" width="15" height="15" rx="3.5" />
              <path d="M8 15.5 11 12.5l2 2 3-4" />
            </svg>
          </span>
          <span className={cn("truncate font-semibold tracking-[0.08em]", isRtl ? "text-base tracking-normal" : "ds-caps-label")}>{brandDisplayName}</span>
        </Link>

        <nav className="col-start-2 row-start-1 hidden items-center justify-self-center gap-1 text-sm text-muted-foreground xl:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={pathname === item.path ? "page" : undefined}
              className={cn(
                "ds-focus-visible rounded-full px-3.5 py-2.5 transition-all duration-[var(--duration-base)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:bg-muted/78 hover:text-foreground",
                pathname === item.path && "bg-muted text-foreground shadow-[var(--elevation-1)]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div
          className={cn(
            "flex shrink-0 items-center gap-2 sm:gap-3",
            isRtl ? "col-start-3 row-start-1 justify-self-start" : "col-start-3 row-start-1 justify-self-end",
          )}
        >
          <div className="ds-glass ds-subtle-ring flex shrink-0 items-center rounded-full border border-border/70 p-1 text-xs font-semibold text-muted-foreground">
            <Link
              href={buildLanguageHref("en")}
              aria-current={currentLang === "en" ? "page" : undefined}
              onClick={closeMobileMenu}
              className={cn(
                "ds-focus-visible rounded-full px-2 py-1.5 transition-colors sm:px-2.5",
                currentLang === "en"
                  ? "bg-primary font-bold text-primary-foreground shadow-[var(--elevation-1)]"
                  : "bg-background/72 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {localizedContent.languageSwitch.en}
            </Link>
            <Link
              href={buildLanguageHref("fa")}
              aria-current={currentLang === "fa" ? "page" : undefined}
              onClick={closeMobileMenu}
              className={cn(
                "ds-focus-visible rounded-full px-2 py-1.5 transition-colors sm:px-2.5",
                currentLang === "fa"
                  ? "bg-primary font-bold text-primary-foreground shadow-[var(--elevation-1)]"
                  : "bg-background/72 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {localizedContent.languageSwitch.fa}
            </Link>
          </div>

          <button
            ref={mobileMenuButtonRef}
            type="button"
            className="ds-focus-visible inline-flex shrink-0 items-center justify-center rounded-xl border border-border/75 bg-background/82 p-2.5 text-foreground shadow-[var(--elevation-1)] transition-all duration-[var(--duration-base)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:bg-muted/80 xl:hidden"
            aria-label={isMobileMenuOpen ? closeButtonLabel : menuButtonLabel}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>
      {isMounted ? createPortal(
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 top-[var(--header-height)] z-[70] overflow-hidden xl:hidden",
            isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
          aria-hidden={!isMobileMenuOpen}
        >
          <div
            className={cn(
              "absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(8,25,47,0.28),rgba(8,25,47,0.5))] backdrop-blur-[2px] transition-opacity duration-[var(--duration-slow)] ease-[var(--ease-emphasized)]",
              isMobileMenuOpen ? "opacity-100" : "opacity-0",
            )}
            onClick={closeMobileMenu}
          />
          <div
            id="mobile-navigation-menu"
            ref={mobileMenuPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label={mobileMenuTitle}
            className={cn(
              "ds-glass absolute inset-y-0 flex w-full max-w-md flex-col overflow-y-auto border-border/70 px-5 pb-6 pt-6 shadow-[var(--elevation-3)] transition-transform duration-[var(--duration-hero)] ease-[var(--ease-emphasized)]",
              // The panel always anchors to the logical "end" edge, which matches
              // where the hamburger button itself sits in each language: `end-0`
              // resolves to `right: 0` under `dir="ltr"` (en, button on the right)
              // and to `left: 0` under `dir="rtl"` (fa, button on the left). The
              // closed-state offset must push the panel further toward that same
              // physical edge (positive for en/right, negative for fa/left) so it
              // ends up fully off-screen rather than sliding back into view.
              "end-0 border-s",
              isMobileMenuOpen ? "translate-x-0" : isRtl ? "-translate-x-full" : "translate-x-full",
            )}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className={cn("min-w-0", isRtl ? "text-right" : "text-left")}>
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  {mobileMenuTitle}
                </p>
                <p className="mt-2 truncate text-sm font-medium text-foreground/90">{brandDisplayName}</p>
              </div>
              <button
                type="button"
                className="ds-focus-visible inline-flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background/80 text-foreground transition-colors hover:bg-muted"
                aria-label={closeButtonLabel}
                onClick={closeMobileMenu}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mb-5 rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,rgba(59,130,246,0.15),rgba(30,64,175,0.06))] px-4 py-3">
              <p className={cn("text-xs text-foreground/85", isRtl ? "text-right" : "text-left")}>
                {mobileMenuSubtitle}
              </p>
            </div>

            <nav className="flex flex-col gap-2 text-base text-muted-foreground">
              {navigationItems.map((item) => (
                <Link
                  key={`mobile-${item.label}`}
                  href={item.href}
                  aria-current={pathname === item.path ? "page" : undefined}
                  className={cn(
                    "ds-focus-visible rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold transition-all duration-[var(--duration-base)] ease-[var(--ease-standard)] hover:border-border/75 hover:bg-muted/72 hover:text-foreground",
                    pathname === item.path && "border-primary/25 bg-primary/10 text-foreground shadow-[var(--elevation-1)]",
                  )}
                  onClick={closeMobileMenu}
                >
                  <span className={cn("block truncate", isRtl ? "text-right" : "text-left")}>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-6 rounded-2xl border border-border/70 bg-background/55 p-4">
              <p className={cn("mb-3 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground", isRtl ? "text-right" : "text-left")}>
                <Globe2 className="size-3.5" />
                {localizedContent.languageSwitch.en}/{localizedContent.languageSwitch.fa}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={buildLanguageHref("en")}
                  aria-current={currentLang === "en" ? "page" : undefined}
                  className={cn(
                    "ds-focus-visible rounded-xl border border-border/75 px-4 py-2 text-center text-sm transition-colors",
                    currentLang === "en"
                      ? "bg-primary font-bold text-primary-foreground shadow-[var(--elevation-1)]"
                      : "bg-background/72 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={closeMobileMenu}
                >
                  {localizedContent.languageSwitch.en}
                </Link>
                <Link
                  href={buildLanguageHref("fa")}
                  aria-current={currentLang === "fa" ? "page" : undefined}
                  className={cn(
                    "ds-focus-visible rounded-xl border border-border/75 px-4 py-2 text-center text-sm transition-colors",
                    currentLang === "fa"
                      ? "bg-primary font-bold text-primary-foreground shadow-[var(--elevation-1)]"
                      : "bg-background/72 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={closeMobileMenu}
                >
                  {localizedContent.languageSwitch.fa}
                </Link>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </header>
  );
}
