/*
  Warnings:

  - You are about to drop the column `hourlyRate` on the `ProjectMember` table. All the data in the column will be lost.
  - The `role` column on the `ProjectMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `chargeRate` to the `ProjectMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contractorRate` to the `ProjectMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'manager', 'member');

-- AlterTable
ALTER TABLE "ProjectMember" DROP COLUMN "hourlyRate",
ADD COLUMN     "chargeRate" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "contractorRate" DECIMAL(10,2) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'member';
