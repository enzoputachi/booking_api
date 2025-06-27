/*
  Warnings:

  - Made the column `passengerAddress` on table `booking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `booking` MODIFY `passengerAddress` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'MANAGER', 'FINANCE') NOT NULL DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE `CompanySetting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyName` VARCHAR(191) NOT NULL,
    `supportEmail` VARCHAR(191) NOT NULL,
    `supportPhone` VARCHAR(191) NULL,
    `websiteUrl` VARCHAR(191) NULL,
    `facebookUrl` VARCHAR(191) NULL,
    `twitterUrl` VARCHAR(191) NULL,
    `instagramUrl` VARCHAR(191) NULL,
    `linkedinUrl` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
