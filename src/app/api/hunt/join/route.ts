import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { ParticipationStatus } from "../../../../../generated/prisma";

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    const body = await req.json();
    const { huntId } = body;

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const hunt = await prisma.treasureHunt.findUnique({
      where: { id: huntId },
      select: {
        id: true,
        fee: true,
        title: true,
        status: true,
        participants: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!hunt) {
      return NextResponse.json({ error: "Hunt not found" }, { status: 404 });
    }

    if (hunt.participants.length > 0) {
      return NextResponse.json(
        { error: "You are already participating in this hunt" },
        { status: 400 },
      );
    }

    if (hunt.status !== "PENDING" && hunt.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "This hunt is no longer open for participation" },
        { status: 400 },
      );
    }

    if (hunt.fee && hunt.fee > 0) {
      const virtualCurrency = await prisma.virtualCurrency.findFirst({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      if (!virtualCurrency || virtualCurrency.amount < hunt.fee) {
        return NextResponse.json(
          { error: "Insufficient funds to join this hunt" },
          { status: 400 },
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.transactionHistory.create({
          data: {
            userId: session.user.id,
            amount: hunt.fee ?? 0,
            transactionType: "SPENT",
            description: `Vous avez rejoins la chasse: ${hunt.title}`,
            virtualCurrencyId: virtualCurrency.id,
          },
        });

        await tx.participation.create({
          data: {
            userId: session.user.id,
            huntId: huntId,
            status: ParticipationStatus.ONGOING,
          },
        });
      });
    } else {
      await prisma.participation.create({
        data: {
          userId: session.user.id,
          huntId: huntId,
          status: ParticipationStatus.ONGOING,
        },
      });
    }

    const participation = await prisma.participation.findFirst({
      where: {
        userId: session.user.id,
        huntId: huntId,
      },
      include: {
        treasureHunt: {
          select: {
            title: true,
            description: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully joined the hunt",
      participation,
    });
  } catch (error) {
    console.error("Error joining hunt:", error);
    return NextResponse.json(
      { error: "Failed to join the treasure hunt" },
      { status: 500 },
    );
  }
}
