import { Container } from "@/components/layout/Container";

type FooterContent = {
  tagline: string;
};

type CompanyContent = {
  name: string;
};

type FooterProps = {
  content: FooterContent;
  company: CompanyContent;
};

export function Footer({ content, company }: FooterProps) {
  return (
    <footer className="border-t bg-background">
      <Container className="flex min-h-16 items-center justify-between gap-4 py-6 text-sm text-muted-foreground">
        <span>{company.name}</span>
        <span>{content.tagline}</span>
      </Container>
    </footer>
  );
}
