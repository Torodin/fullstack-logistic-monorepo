-- AlterTable
ALTER TABLE "Shipment" ALTER COLUMN "id" SET DEFAULT generate_shipment_id('ENV'::text, 1::smallint, 5::smallint),
ALTER COLUMN "phone" DROP NOT NULL;
