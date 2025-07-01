/*
  Warnings:

  - You are about to drop the column `enableSplitPaymet` on the `route` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `route` DROP COLUMN `enableSplitPaymet`,
    ADD COLUMN `isSplitPaymentEnabled` BOOLEAN NOT NULL DEFAULT false;
