/*
  Warnings:

  - You are about to drop the column `startLat` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `startLng` on the `Route` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Route" DROP COLUMN "startLat",
DROP COLUMN "startLng",
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION;
