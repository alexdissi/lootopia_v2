import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { huntId: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { huntId } = params;
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId") || session.user.id;

    // Vérifier si la chasse existe
    const hunt = await prisma.treasureHunt
      .findUnique({
        where: { id: huntId },
      })
      .catch((error) => {
        console.error("Erreur lors de la recherche de la chasse:", error);
        return null;
      });

    if (!hunt) {
      return NextResponse.json(
        { error: "Chasse au trésor introuvable" },
        { status: 404 },
      );
    }

    // Vérifier si l'utilisateur participe à cette chasse
    try {
      const participation = await prisma.participation.findFirst({
        where: {
          huntId,
          userId,
        },
      });

      if (!participation) {
        return NextResponse.json(
          { error: "Participation non trouvée" },
          { status: 404 },
        );
      }

      return NextResponse.json(participation);
    } catch (dbError) {
      console.error("Erreur lors de la requête de participation:", dbError);

      // Retourner une réponse avec statut 200 et un message d'erreur explicite
      // au lieu d'un statut 500 qui pourrait provoquer des problèmes côté client
      return NextResponse.json(
        {
          error: "Erreur lors de la vérification de la participation",
          details: (dbError as Error).message,
          success: false,
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la participation:", error);

    // Retourner une réponse avec statut 200 et un message d'erreur explicite
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de la participation",
        details: (error as Error).message,
        success: false,
      },
      { status: 200 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { huntId: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { huntId } = params;

    // Vérifier si la chasse existe
    const hunt = await prisma.treasureHunt.findUnique({
      where: { id: huntId },
      include: {
        steps: true,
      },
    });

    if (!hunt) {
      return NextResponse.json(
        { error: "Chasse au trésor introuvable" },
        { status: 404 },
      );
    }

    // Vérifier si l'utilisateur participe déjà à cette chasse
    const existingParticipation = await prisma.participation.findFirst({
      where: {
        huntId,
        userId: session.user.id,
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { error: "Vous participez déjà à cette chasse", data: existingParticipation },
        { status: 200 },
      );
    }

    // Vérifier si la chasse est payante et si l'utilisateur a suffisamment de crédits
    if (hunt.fee && hunt.fee > 0) {
      const userCurrency = await prisma.virtualCurrency.findFirst({
        where: { userId: session.user.id },
      });

      if (!userCurrency || userCurrency.amount < hunt.fee) {
        return NextResponse.json(
          { error: "Solde insuffisant pour participer à cette chasse" },
          { status: 400 },
        );
      }

      // Débiter le compte de l'utilisateur
      await prisma.virtualCurrency.update({
        where: { id: userCurrency.id },
        data: { amount: userCurrency.amount - hunt.fee },
      });

      // Enregistrer la transaction
      await prisma.transactionHistory.create({
        data: {
          userId: session.user.id,
          amount: hunt.fee,
          transactionType: "SPENT",
          description: `Inscription à la chasse: ${hunt.title}`,
          virtualCurrencyId: userCurrency.id,
        },
      });
    }

    // Créer une nouvelle participation
    const newParticipation = await prisma.participation.create({
      data: {
        userId: session.user.id,
        huntId,
        status: "ONGOING",
      },
    });

    // Initialiser le suivi de progression pour chaque étape de la chasse
    if (hunt.steps.length > 0) {
      await Promise.all(
        hunt.steps.map((step) =>
          prisma.stepProgress.create({
            data: {
              userId: session.user.id,
              stepId: step.id,
              participationId: newParticipation.id,
              isCompleted: false,
            },
          })
        )
      );
    }

    // Invalider le cache pour mettre à jour l'interface utilisateur
    revalidatePath(`/hunts/${huntId}`);
    revalidatePath(`/dashboard`);

    return NextResponse.json({
      message: "Inscription réussie à la chasse au trésor",
      data: newParticipation,
      success: true,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription à la chasse:", error);

    return NextResponse.json({
      error: "Erreur lors de l'inscription à la chasse",
      details: (error as Error).message,
      success: false,
    }, { status: 200 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { huntId: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { huntId } = params;
    const body = await req.json();
    const { status } = body;

    // Vérifier si la participation existe
    const participation = await prisma.participation.findFirst({
      where: {
        huntId,
        userId: session.user.id,
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "Participation non trouvée" },
        { status: 404 },
      );
    }

    // Mettre à jour le statut de la participation
    const updatedParticipation = await prisma.participation.update({
      where: { id: participation.id },
      data: { status },
    });

    // Si la chasse est marquée comme complétée, enregistrer dans le classement
    if (status === "COMPLETED") {
      // Calculer le score basé sur la progression des étapes
      const stepProgresses = await prisma.stepProgress.findMany({
        where: { participationId: participation.id },
      });

      const totalPoints = stepProgresses.reduce((sum, step) =>
        sum + (step.isCompleted ? step.points : 0)
      , 0);

      // Créer ou mettre à jour l'entrée dans le classement
      await prisma.leaderboardEntry.upsert({
        where: {
          id: `${session.user.id}-${huntId}`,
        },
        update: {
          score: totalPoints,
          completedAt: new Date(),
        },
        create: {
          userId: session.user.id,
          huntId,
          rank: 0, // La position sera mise à jour ultérieurement par un job
          score: totalPoints,
          completedAt: new Date(),
        },
      });
    }

    // Invalider le cache pour mettre à jour l'interface utilisateur
    revalidatePath(`/hunts/${huntId}`);
    revalidatePath(`/dashboard`);

    return NextResponse.json({
      message: "Statut de participation mis à jour",
      data: updatedParticipation,
      success: true,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);

    return NextResponse.json({
      error: "Erreur lors de la mise à jour du statut",
      details: (error as Error).message,
      success: false,
    }, { status: 200 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { huntId: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { huntId } = params;

    // Vérifier si la participation existe
    const participation = await prisma.participation.findFirst({
      where: {
        huntId,
        userId: session.user.id,
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "Participation non trouvée" },
        { status: 404 },
      );
    }

    // Supprimer d'abord les progressions d'étapes associées
    await prisma.stepProgress.deleteMany({
      where: { participationId: participation.id },
    });

    // Supprimer la participation
    await prisma.participation.delete({
      where: { id: participation.id },
    });

    // Invalider le cache pour mettre à jour l'interface utilisateur
    revalidatePath(`/hunts/${huntId}`);
    revalidatePath(`/dashboard`);

    return NextResponse.json({
      message: "Désistement réussi de la chasse au trésor",
      success: true,
    });
  } catch (error) {
    console.error("Erreur lors du désistement de la chasse:", error);

    return NextResponse.json({
      error: "Erreur lors du désistement de la chasse",
      details: (error as Error).message,
      success: false,
    }, { status: 200 });
  }
}
