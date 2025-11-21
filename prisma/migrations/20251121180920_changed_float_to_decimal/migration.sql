/*
  Warnings:

  - You are about to alter the column `budgetAmount` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "budgetAmount" SET DATA TYPE DECIMAL(10,2);
