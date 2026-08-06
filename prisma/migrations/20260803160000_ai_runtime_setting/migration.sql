INSERT INTO "Setting" (
    "id",
    "createdAt",
    "updatedAt",
    "key",
    "value",
    "group",
    "isPublic"
)
VALUES (
    'e911c10d-e838-40b1-b845-11b7f4c445e1',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'ai.runtime',
    '{"provider":"openai","model":"gpt-5.6-sol"}'::jsonb,
    'ai',
    false
)
ON CONFLICT ("key") DO NOTHING;
