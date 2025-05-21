import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
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

    // Vérifier si la chasse existe
    const hunt = await prisma.treasureHunt.findUnique({
      where: { id: huntId },
      select: {
        id: true,
        fee: true,
        status: true,
        participants: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!hunt) {
      return NextResponse.json({ error: "Hunt not found" }, { status: 404 });
    }

    // Vérifier si l'utilisateur n'est pas déjà participant
    if (hunt.participants.length > 0) {
      return NextResponse.json(
        { error: "You are already participating in this hunt" },
        { status: 400 },
      );
    }

    // Vérifier si la chasse est en statut PENDING ou IN_PROGRESS
    if (hunt.status !== "PENDING" && hunt.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "This hunt is no longer open for participation" },
        { status: 400 },
      );
    }

    // Vérification et retrait de la monnaie virtuelle si la chasse est payante
    if (hunt.fee && hunt.fee > 0) {
      // Récupérer la monnaie virtuelle de l'utilisateur
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

      // Effectuer la transaction dans un bloc transactionnel
      await prisma.$transaction(async (tx) => {
        // 1. Mettre à jour la monnaie virtuelle
        const updatedCurrency = await tx.virtualCurrency.update({
          where: { id: virtualCurrency.id },
          data: {
            amount: virtualCurrency.amount - (hunt.fee ?? 0),
            updatedAt: new Date(),
          },
        });

        // 2. Créer un enregistrement de transaction
        await tx.transactionHistory.create({
          data: {
            userId: session.user.id,
            amount: hunt.fee ?? 0,
            transactionType: "SPENT",
            description: `Joined treasure hunt: ${huntId}`,
            virtualCurrencyId: virtualCurrency.id,
          },
        });

        // 3. Créer la participation
        await tx.participation.create({
          data: {
            userId: session.user.id,
            huntId: huntId,
            status: ParticipationStatus.ONGOING,
          },
        });
      });
    } else {
      // Pour les chasses gratuites, créer simplement la participation
      await prisma.participation.create({
        data: {
          userId: session.user.id,
          huntId: huntId,
          status: ParticipationStatus.ONGOING,
        },
      });
    }

    // Récupérer les détails de la participation créée
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
