/*
  Warnings:

  - You are about to drop the column `billable` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN IF EXISTS "billable";

-- AlterTable
ALTER TABLE "TimeEntry" ADD COLUMN IF NOT EXISTS "billable" BOOLEAN NOT NULL DEFAULT false;
