/*
  Warnings:

  - You are about to drop the column `requestLimit` on the `ProductApiUsage` table. All the data in the column will be lost.
  - You are about to drop the column `requestsUsed` on the `ProductApiUsage` table. All the data in the column will be lost.
  - You are about to drop the column `windowEnd` on the `ProductApiUsage` table. All the data in the column will be lost.
  - You are about to drop the column `windowStart` on the `ProductApiUsage` table. All the data in the column will be lost.
  - Added the required column `limit` to the `ProductApiUsage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remaining` to the `ProductApiUsage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resetAt` to the `ProductApiUsage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductApiUsage" DROP COLUMN "requestLimit",
DROP COLUMN "requestsUsed",
DROP COLUMN "windowEnd",
DROP COLUMN "windowStart",
ADD COLUMN     "disabledUntil" TIMESTAMP(3),
ADD COLUMN     "limit" INTEGER NOT NULL,
ADD COLUMN     "remaining" INTEGER NOT NULL,
ADD COLUMN     "resetAt" TIMESTAMP(3) NOT NULL;
