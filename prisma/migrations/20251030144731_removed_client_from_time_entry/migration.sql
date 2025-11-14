/*
  Warnings:

  - You are about to drop the column `clientId` on the `TimeEntry` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TimeEntry" DROP CONSTRAINT IF EXISTS "TimeEntry_clientId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "public"."TimeEntry_clientId_date_idx";

-- AlterTable
ALTER TABLE "TimeEntry" DROP COLUMN IF EXISTS "clientId";
