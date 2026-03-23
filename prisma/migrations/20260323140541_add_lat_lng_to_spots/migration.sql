/*
  Warnings:

  - Added the required column `lat` to the `Spot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lng` to the `Spot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Spot" ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lng" DOUBLE PRECISION NOT NULL;
