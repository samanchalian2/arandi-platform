import Image from "next/image";
import { ArrowUpRight, Camera, ExternalLink, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import type { ReactNode } from "react";

import { Container } from "@/components/layout/Container";
import { PrivacyPreferencesButton } from "@/components/analytics/PrivacyPreferencesButton";

type FooterContent = {
  tagline: string;
  contact: { email: string; phone: string; address: string; mapUrl: string | null };
  social: Record<"instagram" | "telegram" | "whatsapp" | "bale", string | null>;
};

type CompanyContent = { name: string };

type FooterNavigation = {
  enterpriseLinks: {
    company: string;
    services: string;
    solutions: string;
    industries: string;
    projects: string;
    contact: string;
  };
};

type FooterProps = {
  content: FooterContent;
  company: CompanyContent;
  navigation: FooterNavigation;
  lang: "en" | "fa";
  variant?: "standard" | "scrollwise";
};

export function Footer({ content, company, navigation, lang, variant = "standard" }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const mapHref = content.contact.mapUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.contact.address)}`;
  const quickLinksLabel = lang === "fa" ? "دسترسی سریع" : "Quick links";
  const copy = lang === "fa"
    ? {
        map: "مشاهده روی نقشه",
        social: "شبکه‌های اجتماعی",
        unavailable: "هنوز تنظیم نشده",
        copyright: `© ${currentYear} شرکت آرن دی بنیان. تمامی حقوق محفوظ است.`,
        legal: "حریم خصوصی",
      }
    : {
        map: "View on Google Maps",
        social: "Social media",
        unavailable: "Not configured yet",
        copyright: `© ${currentYear} Arandi. All rights reserved.`,
        legal: "Privacy",
      };

  if (variant === "scrollwise") {
    return <ScrollwiseFooter content={content} company={company} navigation={navigation} lang={lang} currentYear={currentYear} mapHref={mapHref} copy={copy} />;
  }

  return (
    <footer className="ds-footer-surface border-t border-border/70" dir={lang === "fa" ? "rtl" : "ltr"} lang={lang}>
      <Container className="py-8 sm:py-9">
        <div className="ds-footer-card ds-subtle-ring grid gap-8 px-5 py-7 sm:px-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] lg:items-start">
          <div className="space-y-3">
            <Image
              src="/brand/arandi-lockup.png"
              alt={company.name}
              width={658}
              height={300}
              className="h-auto w-48 object-contain object-start sm:w-52"
              sizes="(max-width: 640px) 192px, 208px"
              loading="eager"
              unoptimized
            />
            <p className="text-sm leading-7 text-muted-foreground">{content.tagline}</p>
            <nav aria-label={quickLinksLabel} className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-sm font-medium text-muted-foreground">
              {[
                ["/company", navigation.enterpriseLinks.company],
                ["/services", navigation.enterpriseLinks.services],
                ["/projects", navigation.enterpriseLinks.projects],
                ["/contact", navigation.enterpriseLinks.contact],
              ].map(([href, label]) => (
                <a key={href} href={`${href}?lang=${lang}`} className="hover:text-primary hover:underline">{label}</a>
              ))}
            </nav>
          </div>
          <address className="not-italic text-sm leading-7 text-muted-foreground">
            <p className="mb-2 font-semibold text-foreground">{company.name}</p>
            <a className="flex items-start gap-2 hover:text-primary" href={`mailto:${content.contact.email}`}><Mail className="mt-1 size-4 shrink-0" />{content.contact.email}</a>
            <a className="mt-2 flex items-start gap-2 hover:text-primary" href={`tel:${toTel(content.contact.phone)}`}><Phone className="mt-1 size-4 shrink-0" />{content.contact.phone}</a>
            <p className="mt-2 flex items-start gap-2"><MapPin className="mt-1 size-4 shrink-0 text-primary" />{content.contact.address}</p>
            <a className="mt-3 inline-flex items-center gap-1.5 font-semibold text-primary hover:underline" href={mapHref} target="_blank" rel="noreferrer"><ExternalLink className="size-3.5" />{copy.map}</a>
          </address>
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex gap-2" aria-label={copy.social}>
              <SocialLink label="Instagram" href={content.social.instagram} unavailableLabel={copy.unavailable} icon={<Camera className="size-4" />} />
              <SocialLink label="Telegram" href={content.social.telegram} unavailableLabel={copy.unavailable} icon={<Send className="size-4" />} />
              <SocialLink label="WhatsApp" href={content.social.whatsapp} unavailableLabel={copy.unavailable} icon={<MessageCircle className="size-4" />} />
              <SocialLink label="Bale" href={content.social.bale} unavailableLabel={copy.unavailable} icon={<span className="text-xs font-bold">ب</span>} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/90 lg:justify-end">
              <p>{copy.copyright}</p>
              <a href={`/legal?lang=${lang}`} className="font-medium hover:text-primary hover:underline">{copy.legal}</a>
              <PrivacyPreferencesButton lang={lang} />
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function ScrollwiseFooter({ content, company, navigation, lang, currentYear, mapHref, copy }: Omit<FooterProps, "variant"> & {
  currentYear: number;
  mapHref: string;
  copy: { map: string; social: string; unavailable: string; copyright: string; legal: string };
}) {
  const isFa = lang === "fa";
  const socialLinks = [
    { label: "Instagram", href: content.social.instagram, icon: <Camera className="size-4" /> },
    { label: "Telegram", href: content.social.telegram, icon: <Send className="size-4" /> },
    { label: "WhatsApp", href: content.social.whatsapp, icon: <MessageCircle className="size-4" /> },
    { label: "Bale", href: content.social.bale, icon: <span className="text-xs font-bold">ب</span> },
  ].flatMap((item) => item.href ? [{ ...item, href: item.href }] : []);
  const primaryLinks = [
    ["/company", navigation.enterpriseLinks.company],
    ["/services", navigation.enterpriseLinks.services],
    ["/solutions", navigation.enterpriseLinks.solutions],
  ];
  const secondaryLinks = [
    ["/industries", navigation.enterpriseLinks.industries],
    ["/projects", navigation.enterpriseLinks.projects],
    ["/articles", isFa ? "مقالات" : "Articles"],
  ];
  const labels = isFa
    ? { contact: "گفت‌وگو با ما", explore: "مسیرها", portfolio: "حوزه‌ها", connect: "ارتباط", map: "موقعیت روی نقشه", copyright: `© ${currentYear} شرکت آرن دی بنیان. تمامی حقوق محفوظ است.` }
    : { contact: "Talk to us", explore: "Explore", portfolio: "Focus areas", connect: "Connect", map: "Find us on the map", copyright: `© ${currentYear} Arandi. All rights reserved.` };

  return (
    <footer className="ds-footer-surface ds-scrollwise-footer border-t" data-footer-variant="scrollwise" dir={isFa ? "rtl" : "ltr"} lang={lang}>
      <Container className="pb-32 pt-12 sm:pt-14 lg:pt-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_0.8fr_1.15fr] lg:gap-8">
          <div className="max-w-sm">
            <Image
              src="/brand/arandi-lockup.png"
              alt={company.name}
              width={658}
              height={300}
              className="h-auto w-48 object-contain object-start sm:w-52"
              sizes="(max-width: 640px) 192px, 208px"
              loading="eager"
              unoptimized
            />
            <p className="ds-scrollwise-footer-copy mt-5 text-sm leading-7">{content.tagline}</p>
            <a href={`/contact?lang=${lang}`} className="ds-scrollwise-footer-cta ds-focus-visible mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-3 text-sm font-bold">
              {labels.contact}<ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </a>
          </div>

          <nav aria-label={labels.explore} className="space-y-4">
            <p className="ds-scrollwise-footer-heading text-sm font-bold">{labels.explore}</p>
            <ul className="space-y-3 text-sm">
              {primaryLinks.map(([href, label]) => <li key={href}><a href={`${href}?lang=${lang}`} className="ds-scrollwise-footer-link ds-focus-visible">{label}</a></li>)}
            </ul>
          </nav>

          <nav aria-label={labels.portfolio} className="space-y-4">
            <p className="ds-scrollwise-footer-heading text-sm font-bold">{labels.portfolio}</p>
            <ul className="space-y-3 text-sm">
              {secondaryLinks.map(([href, label]) => <li key={href}><a href={`${href}?lang=${lang}`} className="ds-scrollwise-footer-link ds-focus-visible">{label}</a></li>)}
            </ul>
          </nav>

          <address className="not-italic">
            <p className="ds-scrollwise-footer-heading text-sm font-bold">{labels.connect}</p>
            <div className="ds-scrollwise-footer-copy mt-4 space-y-3 text-sm leading-6">
              <a className="ds-scrollwise-footer-link flex items-start gap-2" href={`mailto:${content.contact.email}`}><Mail className="mt-1 size-4 shrink-0" aria-hidden="true" />{content.contact.email}</a>
              <a className="ds-scrollwise-footer-link flex items-start gap-2" href={`tel:${toTel(content.contact.phone)}`}><Phone className="mt-1 size-4 shrink-0" aria-hidden="true" />{content.contact.phone}</a>
              <p className="flex items-start gap-2"><MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />{content.contact.address}</p>
              <a className="ds-scrollwise-footer-link inline-flex items-center gap-1.5 font-semibold" href={mapHref} target="_blank" rel="noreferrer"><ExternalLink className="size-3.5" aria-hidden="true" />{labels.map}</a>
            </div>
            {socialLinks.length > 0 ? <div className="mt-5 flex flex-wrap gap-2" aria-label={copy.social}>
              {socialLinks.map((item) => <SocialLink key={item.label} label={item.label} href={item.href} unavailableLabel={copy.unavailable} icon={item.icon} variant="scrollwise" />)}
            </div> : null}
          </address>
        </div>

        <div className="ds-scrollwise-footer-bottom mt-10 flex flex-col gap-4 border-t pt-5 text-xs sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p>{labels.copyright}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href={`/legal?lang=${lang}`} className="ds-scrollwise-footer-link ds-focus-visible font-semibold">{copy.legal}</a>
            <PrivacyPreferencesButton lang={lang} />
          </div>
        </div>
      </Container>
    </footer>
  );
}

function SocialLink({ label, href, unavailableLabel, icon, variant = "standard" }: { label: string; href: string | null; unavailableLabel: string; icon: ReactNode; variant?: "standard" | "scrollwise" }) {
  const className = variant === "scrollwise"
    ? "ds-scrollwise-footer-social ds-focus-visible inline-flex size-11 items-center justify-center rounded-full border transition-colors"
    : "inline-flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background/70 text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary";
  return href ? <a className={className} href={href} target="_blank" rel="noreferrer" aria-label={label}>{icon}</a> : <span role="img" className={`${className} cursor-not-allowed opacity-45`} aria-label={`${label}: ${unavailableLabel}`} title={`${label}: ${unavailableLabel}`}>{icon}</span>;
}

function toTel(value: string): string {
  const normalizedDigits = value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
  return normalizedDigits.replace(/[^+\d]/g, "");
}
