-- CreateTable
CREATE TABLE "RouteGroup" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "color" TEXT,

    CONSTRAINT "RouteGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "routeGroupId" INTEGER,
    "title" TEXT,
    "description" TEXT,
    "isGuideline" BOOLEAN NOT NULL DEFAULT false,
    "anchorWaypointId" INTEGER,
    "anchorLat" DOUBLE PRECISION,
    "anchorLng" DOUBLE PRECISION,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waypoint" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "isNotable" BOOLEAN NOT NULL DEFAULT false,
    "targetWaypointId" INTEGER,
    "azimuth" INTEGER,
    "seconds" INTEGER,

    CONSTRAINT "Waypoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spot" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "emoji" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Spot_pkey" PRIMARY KEY ("id")
);
