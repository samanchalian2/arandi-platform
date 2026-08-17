INSERT INTO "Theme" (
    "id", "createdAt", "updatedAt", "slug", "name", "isDefault", "tokens", "semanticTokens", "componentOverrides"
)
VALUES (
    gen_random_uuid(), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    'scrollwise', 'Arandi Scrollwise', false,
    '{"colors":{"--background":"oklch(0.965 0.018 85)","--foreground":"oklch(0.22 0.018 255)","--surface":"oklch(0.985 0.012 85)","--card":"oklch(0.985 0.012 85)","--primary":"oklch(0.34 0.09 245)","--primary-foreground":"oklch(0.98 0.008 85)","--accent":"oklch(0.62 0.13 225)","--accent-foreground":"oklch(0.18 0.03 250)","--muted":"oklch(0.91 0.018 82)","--muted-foreground":"oklch(0.42 0.025 250)","--border":"oklch(0.78 0.025 80)","--ring":"oklch(0.51 0.12 235)"},"radius":{"--radius":"0.45rem","--radius-card":"1rem","--radius-panel":"1.4rem"},"spacing":{"--section-block-padding":"clamp(5rem, 9vw, 9rem)"},"shadows":{"--elevation-1":"0 18px 48px -38px rgba(24, 38, 55, 0.38)","--elevation-2":"0 28px 80px -52px rgba(24, 38, 55, 0.46)"}}'::jsonb,
    '{"surface":"var(--surface)","text":"var(--foreground)","accent":"var(--accent)"}'::jsonb,
    '{}'::jsonb
)
ON CONFLICT ("slug") DO NOTHING;
