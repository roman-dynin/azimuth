-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waypoint" (
    "id" SERIAL NOT NULL,
    "parentId" INTEGER,
    "routeId" INTEGER NOT NULL,
    "azimuth" INTEGER NOT NULL,
    "seconds" INTEGER NOT NULL,

    CONSTRAINT "Waypoint_pkey" PRIMARY KEY ("id")
);
