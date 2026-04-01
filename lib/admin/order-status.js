export const ORDER_STATUS_JOIN_CONDITION = `(
    LOWER(TRIM(COALESCE(o.status::text, ''))) = LOWER(TRIM(os.id::text))
    OR LOWER(TRIM(COALESCE(o.status::text, ''))) = LOWER(TRIM(COALESCE(os.code, '')))
    OR LOWER(TRIM(COALESCE(o.status::text, ''))) = LOWER(TRIM(COALESCE(os.title, '')))
    OR LOWER(TRIM(COALESCE(o.status::text, ''))) = LOWER(TRIM(COALESCE(to_jsonb(os)->>'title', '')))
    OR LOWER(TRIM(COALESCE(o.status::text, ''))) = LOWER(TRIM(COALESCE(to_jsonb(os)->>'name', '')))
    OR LOWER(TRIM(COALESCE(o.status::text, ''))) = LOWER(TRIM(COALESCE(to_jsonb(os)->>'label', '')))
)`;

export const ORDER_STATUS_TITLE_EXPR = `COALESCE(
    NULLIF(os.title, ''),
    NULLIF(to_jsonb(os)->>'title', ''),
    NULLIF(to_jsonb(os)->>'name', ''),
    NULLIF(to_jsonb(os)->>'label', ''),
    os.id::text
)`;
