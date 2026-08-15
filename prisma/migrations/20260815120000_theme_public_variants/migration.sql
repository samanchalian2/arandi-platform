-- Exactly one theme can be the public default. Preview selection is cookie-scoped and is never persisted here.
CREATE UNIQUE INDEX "Theme_single_default" ON "Theme" ("isDefault") WHERE "isDefault" = true;

-- A source-owned second theme is installed for every deployed database. Existing custom themes are untouched.
INSERT INTO "Theme" (
    "id", "createdAt", "updatedAt", "slug", "name", "isDefault", "tokens", "semanticTokens", "componentOverrides"
) VALUES (
    '8f95f7c1-7c11-4e86-bb08-3a0d0ddb0a47', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    'arandi-pro', 'Arandi Pro', false,
    '{"colors":{"--background":"oklch(0.975 0.008 247)","--foreground":"oklch(0.18 0.024 255)","--surface":"oklch(1 0 0)","--surface-foreground":"oklch(0.18 0.024 255)","--card":"oklch(1 0 0)","--card-foreground":"oklch(0.18 0.024 255)","--primary":"oklch(0.31 0.058 255)","--primary-foreground":"oklch(0.99 0.003 247)","--secondary":"oklch(0.93 0.016 247)","--secondary-foreground":"oklch(0.25 0.035 255)","--muted":"oklch(0.945 0.012 247)","--muted-foreground":"oklch(0.42 0.028 255)","--accent":"oklch(0.55 0.14 234)","--accent-foreground":"oklch(0.99 0.003 247)","--border":"oklch(0.86 0.018 247)","--input":"oklch(0.82 0.022 247)","--ring":"oklch(0.51 0.13 234)"},"radius":{"--radius":"0.9rem","--radius-control":"0.9rem","--radius-card":"1.5rem","--radius-panel":"2rem"},"shadows":{"--elevation-1":"0 16px 36px -28px rgba(15, 23, 42, 0.38)","--elevation-2":"0 26px 70px -40px rgba(15, 23, 42, 0.42)","--elevation-3":"0 36px 90px -48px rgba(15, 23, 42, 0.5)","--glass-border":"color-mix(in oklch, var(--primary) 16%, white)","--glass-surface":"color-mix(in oklch, white 78%, transparent)"}}'::jsonb,
    '{"surface":"var(--surface)","text":"var(--foreground)","accent":"var(--accent)"}'::jsonb, '{}'::jsonb
) ON CONFLICT ("slug") DO NOTHING;
