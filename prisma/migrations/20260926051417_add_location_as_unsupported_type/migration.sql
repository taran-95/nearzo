/*
  Warnings:

  - Made the column `location` on table `Shop` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Shop" ALTER COLUMN "location" SET NOT NULL;
