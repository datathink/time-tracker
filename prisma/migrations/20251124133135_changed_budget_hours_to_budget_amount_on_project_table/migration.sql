/*
  Warnings:

  - You are about to drop the column `budgetHours` on the `Project` table. All the data in the column will be lost.
  - Made the column `clientId` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Project" DROP CONSTRAINT "Project_clientId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "budgetHours",
ADD COLUMN     "budgetAmount" DECIMAL(10,2),
ALTER COLUMN "clientId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
