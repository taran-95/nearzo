/*
  Warnings:

  - Added the required column `originalname` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "originalname" TEXT NOT NULL;
