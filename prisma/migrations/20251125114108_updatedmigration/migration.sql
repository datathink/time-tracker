/*
  Warnings:

  - You are about to drop the column `payoutRate` on the `ProjectMember` table. All the data in the column will be lost.
  - Added the required column `payoutRate` to the `ProjectMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectMember" DROP COLUMN "contractorRate",
ADD COLUMN     "payoutRate" DECIMAL(10,2) NOT NULL;
