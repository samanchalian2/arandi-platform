import Image from "next/image";
import { Camera, ExternalLink, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import type { ReactNode } from "react";

import { Container } from "@/components/layout/Container";

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
    projects: string;
    contact: string;
  };
};

type FooterProps = {
  content: FooterContent;
  company: CompanyContent;
  navigation: FooterNavigation;
  lang: "en" | "fa";
};

export function Footer({ content, company, navigation, lang }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const mapHref = content.contact.mapUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.contact.address)}`;
  const quickLinksLabel = lang === "fa" ? "دسترسی سریع" : "Quick links";
  const copy = lang === "fa"
    ? {
        map: "مشاهده روی نقشه",
        social: "شبکه‌های اجتماعی",
        unavailable: "هنوز تنظیم نشده",
        copyright: `© ${currentYear} آرندی. تمامی حقوق محفوظ است.`,
        legal: "حریم خصوصی",
      }
    : {
        map: "View on Google Maps",
        social: "Social media",
        unavailable: "Not configured yet",
        copyright: `© ${currentYear} Arandi. All rights reserved.`,
        legal: "Privacy",
      };

  return (
    <footer className="ds-footer-surface border-t border-border/70">
      <Container className="py-8 sm:py-9">
        <div className="ds-footer-card ds-subtle-ring grid gap-8 px-5 py-7 sm:px-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] lg:items-start">
          <div className="space-y-3">
            <Image
              src="/brand/arandi-lockup.png"
              alt={company.name}
              width={1316}
              height={600}
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
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function SocialLink({ label, href, unavailableLabel, icon }: { label: string; href: string | null; unavailableLabel: string; icon: ReactNode }) {
  const className = "inline-flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background/70 text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary";
  return href ? <a className={className} href={href} target="_blank" rel="noreferrer" aria-label={label}>{icon}</a> : <span className={`${className} cursor-not-allowed opacity-45`} aria-label={`${label}: ${unavailableLabel}`} title={`${label}: ${unavailableLabel}`}>{icon}</span>;
}

function toTel(value: string): string {
  const normalizedDigits = value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
  return normalizedDigits.replace(/[^+\d]/g, "");
}
