/*
  Warnings:

  - You are about to drop the column `isSplitPaymentEnabled` on the `route` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `route` DROP COLUMN `isSplitPaymentEnabled`,
    ADD COLUMN `paymentType` VARCHAR(191) NOT NULL DEFAULT 'Full';
