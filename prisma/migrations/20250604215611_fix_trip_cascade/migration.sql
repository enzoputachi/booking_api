-- DropForeignKey
ALTER TABLE `seat` DROP FOREIGN KEY `Seat_tripId_fkey`;

-- DropIndex
DROP INDEX `Seat_tripId_fkey` ON `seat`;

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `Trip`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
