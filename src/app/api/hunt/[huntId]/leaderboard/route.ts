import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { huntId: string } }
) {
  try {
    const huntId = params.huntId;

    // Récupérer le classement pour cette chasse
    const leaderboard = await prisma.leaderboardEntry.findMany({
      where: {
        huntId: huntId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            nickname: true,
          },
        },
      },
      orderBy: [
        { score: "desc" },
        { completedAt: "asc" },
      ],
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Erreur lors de la récupération du classement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du classement" },
      { status: 500 }
    );
  }
}
