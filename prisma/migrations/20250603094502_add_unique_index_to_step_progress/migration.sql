/*
  Warnings:

  - A unique constraint covering the columns `[userId,stepId,participationId]` on the table `StepProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StepProgress_userId_stepId_participationId_key" ON "StepProgress"("userId", "stepId", "participationId");
