-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'member');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'member',
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'active';
