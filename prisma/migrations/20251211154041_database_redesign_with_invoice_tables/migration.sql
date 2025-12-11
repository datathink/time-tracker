/*
  Warnings:

  - You are about to drop the column `projectId` on the `TimeEntry` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `TimeEntry` table. All the data in the column will be lost.
  - Added the required column `projectMemberId` to the `TimeEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- DropForeignKey
ALTER TABLE "TimeEntry" DROP CONSTRAINT "TimeEntry_projectId_fkey";

-- DropForeignKey
ALTER TABLE "TimeEntry" DROP CONSTRAINT "TimeEntry_userId_fkey";

-- DropIndex
DROP INDEX "Project_userId_status_idx";

-- DropIndex
DROP INDEX "TimeEntry_projectId_date_idx";

-- DropIndex
DROP INDEX "TimeEntry_projectId_userId_idx";

-- DropIndex
DROP INDEX "TimeEntry_userId_date_idx";

-- AlterTable
ALTER TABLE "TimeEntry" DROP COLUMN "projectId",
DROP COLUMN "userId",
ADD COLUMN     "projectMemberId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ClientInvoice" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "invoiceTotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ClientInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientLineItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ClientLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInvoice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLineItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "UserLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimeEntry_projectMemberId_date_idx" ON "TimeEntry"("projectMemberId", "date");

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_projectMemberId_fkey" FOREIGN KEY ("projectMemberId") REFERENCES "ProjectMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientInvoice" ADD CONSTRAINT "ClientInvoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientLineItem" ADD CONSTRAINT "ClientLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "ClientInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvoice" ADD CONSTRAINT "UserInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLineItem" ADD CONSTRAINT "UserLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "UserInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
