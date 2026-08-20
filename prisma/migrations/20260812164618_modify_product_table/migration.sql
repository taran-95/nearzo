/*
  Warnings:

  - You are about to drop the column `cost` on the `Product` table. All the data in the column will be lost.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_location` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_name` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "cost",
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "store_location" TEXT NOT NULL,
ADD COLUMN     "store_name" TEXT NOT NULL;
