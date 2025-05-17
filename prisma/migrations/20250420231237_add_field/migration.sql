/*
  Warnings:

  - A unique constraint covering the columns `[stripeSessionId]` on the table `TransactionHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TransactionHistory" ADD COLUMN     "stripeSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TransactionHistory_stripeSessionId_key" ON "TransactionHistory"("stripeSessionId");
