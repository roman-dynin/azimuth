/*
  Warnings:

  - You are about to drop the column `parentId` on the `Waypoint` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "parentWaypointId" INTEGER;

-- AlterTable
ALTER TABLE "Waypoint" DROP COLUMN "parentId";
