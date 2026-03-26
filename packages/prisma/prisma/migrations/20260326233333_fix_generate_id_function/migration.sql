CREATE OR REPLACE FUNCTION generate_shipment_id(prefix text, start_value smallint, padding_length smallint) RETURNS text AS $$
DECLARE
    today_text text := to_char(current_date, 'YYYYMMDD');
    new_value integer;
BEGIN
    SELECT COALESCE(
        MAX((substring(id from '([0-9]+)$'))::integer) + 1,
        start_value::integer
    )
    INTO new_value
    FROM "Shipment"
    WHERE id LIKE prefix || '-' || today_text || '-%';

    RETURN prefix || '-' || today_text || '-' || lpad(new_value::text, padding_length, '0');
END;
$$ LANGUAGE PLPGSQL VOLATILE;

-- AlterTable
ALTER TABLE "Shipment"
ALTER COLUMN "id"
SET DEFAULT generate_shipment_id (
    'ENV'::text,
    1::smallint,
    5::smallint
);
