/*
  Warnings:

  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `store_location` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `store_name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `uploaded_at` on the `Product` table. All the data in the column will be lost.
  - Added the required column `type` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('CUSTOM', 'IDENTIFIED');

-- CreateEnum
CREATE TYPE "ProductSource" AS ENUM ('UPC_DEV', 'OPENFOODFACTS', 'UPCITEMDB');

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "price",
DROP COLUMN "store_location",
DROP COLUMN "store_name",
DROP COLUMN "uploaded_at",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" "ProductType" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "CustomProduct" (
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "CustomProduct_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "IdentifiedProduct" (
    "productId" INTEGER NOT NULL,
    "gtin" TEXT NOT NULL,
    "sourceProvider" "ProductSource" NOT NULL,

    CONSTRAINT "IdentifiedProduct_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "searchText" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdentifiedProduct_sourceProvider_idx" ON "IdentifiedProduct"("sourceProvider");

-- CreateIndex
CREATE UNIQUE INDEX "IdentifiedProduct_gtin_key" ON "IdentifiedProduct"("gtin");

-- CreateIndex
CREATE INDEX "Offer_productId_idx" ON "Offer"("productId");

-- CreateIndex
CREATE INDEX "Offer_sellerId_idx" ON "Offer"("sellerId");

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

-- AddForeignKey
ALTER TABLE "CustomProduct" ADD CONSTRAINT "CustomProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentifiedProduct" ADD CONSTRAINT "IdentifiedProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "CustomProduct"("productId") ON DELETE CASCADE ON UPDATE CASCADE;
