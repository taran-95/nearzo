/*
  Warnings:

  - You are about to drop the column `location` on the `Shop` table. All the data in the column will be lost.
  - Added the required column `address` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "location",
ADD COLUMN     "address" TEXT NOT NULL;

CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE "Shop"
ADD COLUMN "location" geography(Point, 4326);

CREATE INDEX "Place_location_idx"
ON "Shop"
USING GIST ("location");
