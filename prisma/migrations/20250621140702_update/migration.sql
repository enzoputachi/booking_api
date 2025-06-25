/*
  Warnings:

  - You are about to drop the column `seatId` on the `booking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_seatId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_tripId_fkey`;

-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_bookingId_fkey`;

-- DropIndex
DROP INDEX `Booking_seatId_key` ON `booking`;

-- DropIndex
DROP INDEX `Booking_tripId_fkey` ON `booking`;

-- DropIndex
DROP INDEX `Payment_bookingId_key` ON `payment`;

-- AlterTable
ALTER TABLE `booking` DROP COLUMN `seatId`,
    ADD COLUMN `isSplitPayment` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `passengerAddress` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `seat` ADD COLUMN `bookingId` INTEGER NULL;

-- CreateTable
CREATE TABLE `SingletonJob` (
    `name` VARCHAR(191) NOT NULL,
    `lockedAt` DATETIME(3) NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Seat_tripId_status_idx` ON `Seat`(`tripId`, `status`);

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `Trip`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
