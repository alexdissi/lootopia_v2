-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "huntId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "TreasureHunt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
