/*
  Warnings:

  - You are about to drop the column `supportEmail` on the `companysetting` table. All the data in the column will be lost.
  - You are about to drop the column `supportPhone` on the `companysetting` table. All the data in the column will be lost.
  - Added the required column `contactEmail` to the `CompanySetting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `companysetting` DROP COLUMN `supportEmail`,
    DROP COLUMN `supportPhone`,
    ADD COLUMN `bankTransferEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `bookingDeadlineHours` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `bookingEmailsEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `contactEmail` VARCHAR(191) NOT NULL,
    ADD COLUMN `contactPhone` VARCHAR(191) NULL,
    ADD COLUMN `maintenanceMode` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `maxSeatsPerBooking` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `paymentEmailsEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paystackEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paystackPublicKey` VARCHAR(191) NULL,
    ADD COLUMN `reminderHours` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `reminderSmsEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `seatHoldMinutes` INTEGER NOT NULL DEFAULT 0;
