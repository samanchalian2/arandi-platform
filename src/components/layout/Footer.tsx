import { Container } from "@/components/layout/Container";
import { getCompanyContent } from "@/content/company";
import type { FooterContent, Language } from "@/content/siteContent";

type FooterProps = {
  content: FooterContent;
  lang?: Language;
};

export function Footer({ content, lang = "en" }: FooterProps) {
  const company = getCompanyContent(lang);
  return (
    <footer className="border-t bg-background">
      <Container className="flex min-h-16 items-center justify-between gap-4 py-6 text-sm text-muted-foreground">
        <span>{company.name}</span>
        <span>{content.tagline}</span>
      </Container>
    </footer>
  );
}
