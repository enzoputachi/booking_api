/*
  Warnings:

  - You are about to drop the column `bookingtoken` on the `seat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Seat` DROP COLUMN `bookingtoken`,
    ADD COLUMN `bookingToken` VARCHAR(191) NULL;
