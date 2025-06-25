/*
  Warnings:

  - You are about to drop the column `contactInfo` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `trip` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `trip` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paystackRef]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobile` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nextOfKinName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nextOfKinPhone` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `busType` to the `Bus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` DROP COLUMN `contactInfo`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `mobile` VARCHAR(191) NOT NULL,
    ADD COLUMN `nextOfKinName` VARCHAR(191) NOT NULL,
    ADD COLUMN `nextOfKinPhone` VARCHAR(191) NOT NULL,
    ADD COLUMN `passengerAge` INTEGER NULL,
    ADD COLUMN `passengerTitle` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `status` ENUM('DRAFT', 'PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    MODIFY `ipAddress` VARCHAR(191) NULL,
    MODIFY `sessionId` VARCHAR(191) NULL,
    MODIFY `userAgent` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `bus` ADD COLUMN `busType` VARCHAR(191) NOT NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `payment` DROP COLUMN `method`,
    ADD COLUMN `authorization` JSON NULL,
    ADD COLUMN `channel` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `currency` VARCHAR(191) NULL DEFAULT 'NGN',
    ADD COLUMN `customerId` VARCHAR(191) NULL,
    ADD COLUMN `paystackRef` VARCHAR(191) NULL,
    ADD COLUMN `provider` VARCHAR(191) NULL DEFAULT 'Paystack',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `status` ENUM('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `route` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `seat` ADD COLUMN `reservedAt` DATETIME(3) NULL,
    MODIFY `status` ENUM('AVAILABLE', 'BOOKED', 'RESERVED') NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE `trip` DROP COLUMN `destination`,
    DROP COLUMN `origin`,
    ADD COLUMN `price` DOUBLE NOT NULL,
    ADD COLUMN `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `lastLogin` DATETIME(3) NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE UNIQUE INDEX `Payment_paystackRef_key` ON `Payment`(`paystackRef`);
