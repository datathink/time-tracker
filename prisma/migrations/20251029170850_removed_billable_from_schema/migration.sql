/*
  Warnings:

  - You are about to drop the column `billable` on the `TimeEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TimeEntry" DROP COLUMN IF EXISTS "billable";
