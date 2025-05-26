/*
  Warnings:

  - You are about to drop the column `isMfaEnabled` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TreasureHunt" DROP CONSTRAINT "TreasureHunt_createdById_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "isMfaEnabled";

-- CreateTable
CREATE TABLE "twoFactor" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "twoFactor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TreasureHunt" ADD CONSTRAINT "TreasureHunt_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
