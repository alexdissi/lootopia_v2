import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserRanking } from "@/lib/leaderboard";

// GET: Récupérer le classement d'un utilisateur spécifique dans une chasse au trésor
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const { searchParams } = new URL(req.url);
    const huntId = searchParams.get("huntId");
    const userId = searchParams.get("userId");

    console.log("GET /api/hunt/leaderboard/user - Request params:", {
      huntId,
      userId,
      sessionUserId: session?.user?.id,
    });

    if (!huntId) {
      console.log(
        "GET /api/hunt/leaderboard/user - Bad request: No huntId provided",
      );
      return NextResponse.json(
        { error: "ID de chasse requis" },
        { status: 400 },
      );
    }

    if (!userId) {
      console.log(
        "GET /api/hunt/leaderboard/user - Bad request: No userId provided",
      );
      return NextResponse.json(
        { error: "ID d'utilisateur requis" },
        { status: 400 },
      );
    }

    // Vérifier si l'utilisateur a accès à cette information
    if (!session?.user) {
      console.log(
        "GET /api/hunt/leaderboard/user - Unauthorized: No session user",
      );
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 },
      );
    }

    try {
      // Récupérer le classement de l'utilisateur
      const userRanking = await getUserRanking(userId, huntId);

      if (!userRanking) {
        console.log("GET /api/hunt/leaderboard/user - User ranking not found");
        return NextResponse.json(
          { error: "Classement non trouvé pour cet utilisateur" },
          { status: 404 },
        );
      }

      console.log(
        "GET /api/hunt/leaderboard/user - User ranking retrieved successfully",
      );
      return NextResponse.json(userRanking);
    } catch (error) {
      console.error(
        "GET /api/hunt/leaderboard/user - Error retrieving user ranking:",
        error,
      );
      return NextResponse.json(
        { error: "Erreur lors de la récupération du classement" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("GET /api/hunt/leaderboard/user - Server error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
