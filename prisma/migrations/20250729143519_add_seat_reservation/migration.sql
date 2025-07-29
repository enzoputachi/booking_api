-- CreateTable
CREATE TABLE `SeatReservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seatId` INTEGER NOT NULL,
    `bookingToken` VARCHAR(191) NOT NULL,
    `reservedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',

    INDEX `SeatReservation_expiresAt_idx`(`expiresAt`),
    UNIQUE INDEX `SeatReservation_seatId_key`(`seatId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SeatReservation` ADD CONSTRAINT `SeatReservation_seatId_fkey` FOREIGN KEY (`seatId`) REFERENCES `Seat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
