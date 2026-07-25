import Link from "next/link";

import { Container } from "@/components/layout/Container";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.24em] text-foreground uppercase"
          aria-label="Arandi Platform home"
        >
          Arandi
        </Link>
        <nav className="text-sm text-muted-foreground" aria-label="Primary navigation">
          <span>Platform foundation</span>
        </nav>
      </Container>
    </header>
  );
}
