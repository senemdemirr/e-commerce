export const ORDER_STATUS_JOIN_CONDITION = 'os.id::text = o.status::text';

export const ORDER_STATUS_TITLE_EXPR = `COALESCE(
    NULLIF(os.title, ''),
    NULLIF(to_jsonb(os)->>'title', ''),
    NULLIF(to_jsonb(os)->>'name', ''),
    NULLIF(to_jsonb(os)->>'label', ''),
    os.id::text
)`;
