import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const huntId = params.id;

    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const hunt = await prisma.treasureHunt.findUnique({
      where: { id: huntId },
      select: {
        createdById: true,
        status: true,
        participants: true,
      },
    });

    if (!hunt) {
      return NextResponse.json({ error: "Hunt not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (hunt.createdById !== session.user.id && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to complete this hunt" },
        { status: 403 },
      );
    }

    if (hunt.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Hunt can only be completed from IN_PROGRESS status" },
        { status: 400 },
      );
    }

    const updatedHunt = await prisma.$transaction(async (tx) => {
      const hunt = await tx.treasureHunt.update({
        where: { id: huntId },
        data: {
          status: "COMPLETED",
          endDate: new Date(),
          isFinished: true,
        },
      });

      await tx.participation.updateMany({
        where: {
          huntId: huntId,
          status: "ONGOING",
        },
        data: {
          status: "COMPLETED",
        },
      });

      // Générer des entrées de classement pour les participants qui ont terminé
      // Ceci est un exemple simple, vous pourriez avoir une logique plus complexe
      // pour calculer les scores basés sur le temps ou d'autres facteurs
      const participants = await tx.participation.findMany({
        where: {
          huntId: huntId,
          status: "COMPLETED",
        },
        select: {
          userId: true,
        },
        orderBy: {
          joinDate: "asc",
        },
      });

      for (let i = 0; i < participants.length; i++) {
        await tx.leaderboardEntry.create({
          data: {
            userId: participants[i].userId,
            huntId: huntId,
            rank: i + 1,
            score: 100 - i * 10,
            completedAt: new Date(),
          },
        });
      }

      return hunt;
    });

    return NextResponse.json(updatedHunt);
  } catch {
    return NextResponse.json(
      { error: "Failed to complete treasure hunt" },
      { status: 500 },
    );
  }
}
