-- Make Persian the canonical default while retaining explicit English support.
UPDATE "Language"
SET "isDefault" = ("code" = 'fa')
WHERE "code" IN ('en', 'fa');

-- Apply the approved public brand labels without changing other CMS settings.
UPDATE "Setting"
SET "value" = jsonb_set(
    jsonb_set("value", '{en,shortName}', '"Arandi"'::jsonb, true),
    '{fa,shortName}', '"آرن دی بنیان"'::jsonb,
    true
)
WHERE "key" = 'site.company'
  AND "isPublic" = true;
