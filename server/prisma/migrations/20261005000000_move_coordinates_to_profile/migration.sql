-- AlterTable: add coordinates to profiles
ALTER TABLE "profiles" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "profiles" ADD COLUMN "longitude" DOUBLE PRECISION;

-- Copy coordinates from users to profiles (only for doctors who have profiles)
UPDATE "profiles" p
SET "latitude" = u."latitude", "longitude" = u."longitude"
FROM "users" u
WHERE p."userId" = u."id" AND u."latitude" IS NOT NULL AND u."longitude" IS NOT NULL;

-- Drop coordinates from users
ALTER TABLE "users" DROP COLUMN "latitude";
ALTER TABLE "users" DROP COLUMN "longitude";

-- CreateIndex: spatial index for geo search
CREATE INDEX "profiles_latitude_longitude_idx" ON "profiles"("latitude", "longitude");
