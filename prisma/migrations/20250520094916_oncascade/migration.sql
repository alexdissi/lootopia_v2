-- DropForeignKey
ALTER TABLE "Artefact" DROP CONSTRAINT "Artefact_userId_fkey";

-- DropForeignKey
ALTER TABLE "Craft" DROP CONSTRAINT "Craft_userId_fkey";

-- DropForeignKey
ALTER TABLE "LeaderboardEntry" DROP CONSTRAINT "LeaderboardEntry_userId_fkey";

-- DropForeignKey
ALTER TABLE "Participation" DROP CONSTRAINT "Participation_userId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionHistory" DROP CONSTRAINT "TransactionHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionHistory" DROP CONSTRAINT "TransactionHistory_virtualCurrencyId_fkey";

-- DropForeignKey
ALTER TABLE "VirtualCurrency" DROP CONSTRAINT "VirtualCurrency_userId_fkey";

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artefact" ADD CONSTRAINT "Artefact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualCurrency" ADD CONSTRAINT "VirtualCurrency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionHistory" ADD CONSTRAINT "TransactionHistory_virtualCurrencyId_fkey" FOREIGN KEY ("virtualCurrencyId") REFERENCES "VirtualCurrency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionHistory" ADD CONSTRAINT "TransactionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Craft" ADD CONSTRAINT "Craft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
