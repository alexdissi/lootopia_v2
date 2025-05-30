-- AlterTable
ALTER TABLE "HuntStep" ADD COLUMN     "hint" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "radius" INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN     "title" TEXT;

-- CreateTable
CREATE TABLE "StepDiscovery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "distance" INTEGER NOT NULL,

    CONSTRAINT "StepDiscovery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StepDiscovery_userId_stepId_key" ON "StepDiscovery"("userId", "stepId");

-- AddForeignKey
ALTER TABLE "StepDiscovery" ADD CONSTRAINT "StepDiscovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepDiscovery" ADD CONSTRAINT "StepDiscovery_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "HuntStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
