import Link from "next/link";

import { Container } from "@/components/layout/Container";

const navigationItems = [
  { href: "#hero", label: "Overview" },
  { href: "#features", label: "Capabilities" },
  { href: "mailto:hello@arandi.platform", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <Container className="header-shell flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground"
          aria-label="Arandi Platform home"
        >
          Arandi
        </Link>

        <div className="header-actions flex items-center gap-2">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Primary navigation">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-3 py-2 transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ms-2 flex items-center rounded-full border border-border/70 bg-background/90 p-1 text-xs font-medium text-muted-foreground">
            <Link href="/?lang=en" className="rounded-full px-2.5 py-1.5 transition-colors hover:bg-muted hover:text-foreground">
              EN
            </Link>
            <Link href="/?lang=fa" className="rounded-full px-2.5 py-1.5 transition-colors hover:bg-muted hover:text-foreground">
              FA
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
