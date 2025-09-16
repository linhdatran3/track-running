/*
  Warnings:

  - You are about to drop the column `lastSyncedAt` on the `Activity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Activity" DROP COLUMN "lastSyncedAt";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "lastSyncedAt" TIMESTAMP(3);
