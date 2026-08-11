import Image from "next/image";

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
  const currentYear = new Date().getFullYear();

  return (
    <footer className="ds-footer-surface border-t border-border/70">
      <Container className="py-8 sm:py-9">
        <div className="ds-footer-card ds-subtle-ring flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
          <div className="space-y-2">
            <Image
              src="/brand/arandi-lockup.png"
              alt={company.name}
              width={1316}
              height={600}
              className="h-auto w-40 object-contain object-start sm:w-44"
            />
            <p className="text-base font-semibold tracking-[-0.01em] text-foreground">{company.name}</p>
            <p className="text-sm leading-7 text-muted-foreground">{content.tagline}</p>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/90">
            {currentYear}
          </p>
        </div>
      </Container>
    </footer>
  );
}
