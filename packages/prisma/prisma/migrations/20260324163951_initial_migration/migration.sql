CREATE OR REPLACE FUNCTION generate_shipment_id(prefix text, start_value smallint, padding_length smallint) RETURNS text AS $$
DECLARE
    today date := current_date;
    new_value smallint;
    formatted_id text;
BEGIN
    SELECT max(CAST(SUBSTRING(id, length(prefix) + 1) AS smallint)) INTO new_value FROM "Shipment";
    
    IF new_value IS NULL THEN
        new_value := start_value;
    ELSE
        new_value := new_value + 1;
    END IF;
    
    formatted_id := prefix || '-' || to_char(today, 'YYYYMMDD') || '-' || lpad(new_value::text, padding_length, '0');
    
    RETURN formatted_id;
END;
$$ LANGUAGE PLPGSQL VOLATILE;

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OPERATOR', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "State" AS ENUM ('CREATED', 'IN_WAREHOUSE', 'IN_TRANSIT', 'IN_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL DEFAULT generate_shipment_id('ENV'::text, 1::smallint, 5::smallint),
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "addressee" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "state" "State" NOT NULL DEFAULT 'CREATED',
    "delivered_at" TIMESTAMP(3),

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
