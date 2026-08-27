-- Apply the stakeholder-approved large liquid-glass brand defaults only when
-- the earlier standard header values are still present.
UPDATE "Setting"
SET "value" = jsonb_set(
        jsonb_set("value", '{headerLogoSize}', '128'::jsonb, true),
        '{headerTitleSize}', '28'::jsonb,
        true
    ),
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "key" = 'site.scrollwiseExperience'
  AND "value"->>'headerLogoSize' = '48'
  AND "value"->>'headerTitleSize' = '16';
