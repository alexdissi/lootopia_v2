import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: { huntId: string } }
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
    const hunt = await prisma.treasureHunt.findUnique({
      where: { id: huntId },
    }).catch(error => {
      console.error("Erreur lors de la recherche de la chasse:", error);
      return null;
    });

    if (!hunt) {
      return NextResponse.json(
        { error: "Chasse au trésor introuvable" },
        { status: 404 }
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
          { status: 404 }
        );
      }

      return NextResponse.json(participation);
    } catch (dbError) {
      console.error("Erreur lors de la requête de participation:", dbError);

      // Retourner une réponse avec statut 200 et un message d'erreur explicite
      // au lieu d'un statut 500 qui pourrait provoquer des problèmes côté client
      return NextResponse.json({
        error: "Erreur lors de la vérification de la participation",
        details: (dbError as Error).message,
        success: false
      }, { status: 200 });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la participation:", error);

    // Retourner une réponse avec statut 200 et un message d'erreur explicite
    return NextResponse.json({
      error: "Erreur lors de la récupération de la participation",
      details: (error as Error).message,
      success: false
    }, { status: 200 });
  }
}
