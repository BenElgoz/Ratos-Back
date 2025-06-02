/*
  Warnings:

  - You are about to drop the column `maxActivations` on the `Promotion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "maxActivations",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "offerType" TEXT;
