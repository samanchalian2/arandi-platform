INSERT INTO "Setting" (
    "id", "createdAt", "updatedAt", "key", "value", "group", "isPublic"
)
VALUES (
    'c5d72f04-e16c-4926-8e42-f0f5cda11307',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'site.jupiterGuide',
    '{"appUrl":"","organizationRequestUrl":"","supportUrl":"/contact?lang=fa","companyName":""}'::jsonb,
    'product-guides',
    true
)
ON CONFLICT ("key") DO NOTHING;
