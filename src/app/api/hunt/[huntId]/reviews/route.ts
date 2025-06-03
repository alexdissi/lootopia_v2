import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { huntId: string } },
) {
  try {
    const huntId = params.huntId;

    if (!huntId) {
      return NextResponse.json({ error: "huntId requis" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { huntId },
      include: {
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { huntId, comment, score } = await request.json();

    if (!huntId || !comment || typeof score !== "number") {
      return NextResponse.json(
        { error: "Paramètres manquants ou invalides" },
        { status: 400 },
      );
    }

    const newReview = await prisma.review.create({
      data: {
        huntId,
        userId: session.user.id,
        comment,
        score,
      },
    });

    return NextResponse.json(newReview);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
