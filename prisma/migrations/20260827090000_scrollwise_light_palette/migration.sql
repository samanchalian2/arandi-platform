-- Bring the untouched Scrollwise internal-page palette into the same light,
-- cool-neutral family as the published narrative homepage. Preserve any theme
-- that has already been intentionally customized away from the legacy baseline.
UPDATE "Theme"
SET "updatedAt" = CURRENT_TIMESTAMP,
    "tokens" = "tokens" || jsonb_build_object(
    'colors', ("tokens"->'colors') || jsonb_build_object(
        '--background', 'oklch(0.985 0.006 247)',
        '--foreground', 'oklch(0.2 0.016 255)',
        '--surface', 'oklch(0.996 0.004 247)',
        '--card', 'oklch(0.996 0.004 247)',
        '--primary-foreground', 'oklch(0.985 0.004 247)',
        '--muted', 'oklch(0.95 0.011 247)',
        '--muted-foreground', 'oklch(0.47 0.024 255)',
        '--border', 'oklch(0.89 0.012 247)',
        '--ring', 'oklch(0.6 0.13 238)'
    )
)
WHERE "slug" = 'scrollwise'
  AND "tokens"->'colors'->>'--background' = 'oklch(0.965 0.018 85)';
