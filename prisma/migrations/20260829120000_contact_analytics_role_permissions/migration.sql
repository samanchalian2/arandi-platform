-- Keep persisted system roles aligned with the CMS permissions introduced for
-- the consented analytics dashboard and operational contact inbox.
UPDATE "Role"
SET "permissions" = ARRAY(
    SELECT DISTINCT permission
    FROM unnest(
        "permissions" || ARRAY['contact.read', 'contact.write', 'analytics.read']::text[]
    ) AS permission
    ORDER BY permission
)
WHERE "key" IN ('SuperAdmin', 'Admin');
