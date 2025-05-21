import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (session.user.id !== params.userId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();

    const { name, email, image } = body;
    if (typeof name !== "string" || typeof email !== "string") {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: {
        name,
        email,
        image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour utilisateur :", error);
    return NextResponse.json(
      { error: "Erreur interne serveur" },
      { status: 500 }
    );
  }
}
