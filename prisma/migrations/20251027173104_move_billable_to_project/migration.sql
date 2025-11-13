/*
  Warnings:

  - You are about to drop the column `billable` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "billable";

-- AlterTable
ALTER TABLE "TimeEntry" ADD COLUMN     "billable" BOOLEAN NOT NULL DEFAULT false;
