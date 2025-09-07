-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "stravaAthleteId" INTEGER,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "stravaId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "startLocal" TIMESTAMP(3) NOT NULL,
    "startUtc" TIMESTAMP(3),
    "distanceM" INTEGER NOT NULL,
    "movingTimeS" INTEGER NOT NULL,
    "elapsedTimeS" INTEGER,
    "averageSpeed" DOUBLE PRECISION,
    "maxSpeed" DOUBLE PRECISION,
    "averageHeartrate" DOUBLE PRECISION,
    "maxHeartrate" DOUBLE PRECISION,
    "averageCadence" DOUBLE PRECISION,
    "totalElevationGain" DOUBLE PRECISION,
    "sportType" TEXT,
    "deviceName" TEXT,
    "externalId" TEXT,
    "isGarmin" BOOLEAN NOT NULL DEFAULT false,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActivityStream" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityStream_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_stravaAthleteId_key" ON "public"."User"("stravaAthleteId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_stravaId_key" ON "public"."Activity"("stravaId");

-- AddForeignKey
ALTER TABLE "public"."ActivityStream" ADD CONSTRAINT "ActivityStream_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
