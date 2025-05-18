/*
  Warnings:

  - Added the required column `source` to the `Artefact` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'ORGANIZER', 'ADMIN');

-- CreateEnum
CREATE TYPE "HuntMode" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ArtefactSource" AS ENUM ('CACHE', 'SHOP', 'CRAFT', 'EVENT');

-- CreateEnum
CREATE TYPE "CurrencySourceType" AS ENUM ('EARNED', 'PURCHASED', 'GIFTED');

-- AlterTable
ALTER TABLE "Artefact" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" "ArtefactSource" NOT NULL;

-- AlterTable
ALTER TABLE "TreasureHunt" ADD COLUMN     "fee" INTEGER,
ADD COLUMN     "isFinished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mapStyle" TEXT,
ADD COLUMN     "mode" "HuntMode" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "VirtualCurrency" ADD COLUMN     "type" "CurrencySourceType" NOT NULL DEFAULT 'EARNED';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isMfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'PLAYER';

-- CreateTable
CREATE TABLE "Craft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Craft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraftMaterial" (
    "id" TEXT NOT NULL,
    "craftId" TEXT NOT NULL,
    "artefactId" TEXT NOT NULL,

    CONSTRAINT "CraftMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "huntId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Craft" ADD CONSTRAINT "Craft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Craft" ADD CONSTRAINT "Craft_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Artefact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftMaterial" ADD CONSTRAINT "CraftMaterial_craftId_fkey" FOREIGN KEY ("craftId") REFERENCES "Craft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftMaterial" ADD CONSTRAINT "CraftMaterial_artefactId_fkey" FOREIGN KEY ("artefactId") REFERENCES "Artefact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "TreasureHunt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
