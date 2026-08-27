-- Apply the stakeholder-approved simple 64px Scrollwise symbol only to the
-- immediately preceding 128px/28px baseline, preserving later Admin choices.
UPDATE "Setting"
SET "value" = jsonb_set("value", '{headerLogoSize}', '64'::jsonb, true),
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "key" = 'site.scrollwiseExperience'
  AND "value"->>'headerLogoSize' = '128'
  AND "value"->>'headerTitleSize' = '28';
