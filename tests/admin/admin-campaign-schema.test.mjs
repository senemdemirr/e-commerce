import { buildCampaignTimestampTypeMigrationQuery } from '../../lib/admin/campaignSchema.js';

describe('Admin campaign schema', () => {
    test('guards timestamp migrations so existing timestamptz values are not reinterpreted', () => {
        const query = buildCampaignTimestampTypeMigrationQuery();
        const timestampColumns = ['starts_at', 'ends_at', 'created_at', 'updated_at'];

        expect(query).toContain('DO $$');
        expect(query).toContain("data_type <> 'timestamp with time zone'");

        timestampColumns.forEach((columnName) => {
            expect(query).toContain(`column_name = '${columnName}'`);
            expect(query).toContain(
                `ALTER COLUMN ${columnName} TYPE TIMESTAMPTZ USING ${columnName} AT TIME ZONE 'UTC'`
            );
        });
    });
});
