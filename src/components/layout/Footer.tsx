import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <Container className="flex min-h-16 items-center justify-between gap-4 py-6 text-sm text-muted-foreground">
        <span>Arandi Platform</span>
        <span>AI-ready enterprise foundation</span>
      </Container>
    </footer>
  );
}
