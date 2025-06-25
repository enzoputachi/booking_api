/*
  Warnings:

  - Added the required column `seatsPerRow` to the `Bus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bus` ADD COLUMN `seatsPerRow` INTEGER NOT NULL;
