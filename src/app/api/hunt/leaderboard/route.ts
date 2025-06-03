import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";

// GET: Récupérer le classement d'une chasse au trésor
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const { searchParams } = new URL(req.url);
    const huntId = searchParams.get("huntId");
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit") as string)
      : undefined;

    console.log("GET /api/hunt/leaderboard - Request params:", {
      huntId,
      limit,
      userId: session?.user?.id,
    });

    if (!huntId) {
      console.log(
        "GET /api/hunt/leaderboard - Bad request: No huntId provided",
      );
      return NextResponse.json(
        { error: "ID de chasse requis" },
        { status: 400 },
      );
    }

    // Appel à notre fonction pour récupérer le classement
    const result = await getLeaderboard(huntId, limit);

    if (!result.success) {
      console.error(
        "GET /api/hunt/leaderboard - Error fetching leaderboard:",
        result.error,
      );
      return NextResponse.json(
        { error: "Erreur lors de la récupération du classement" },
        { status: 500 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors de la récupération du classement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du classement" },
      { status: 500 },
    );
  }
}
