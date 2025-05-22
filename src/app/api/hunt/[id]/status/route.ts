import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 },
      );
    }

    const { status } = await req.json();

    if (!["PENDING", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const hunt = await prisma.treasureHunt.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!hunt) {
      return NextResponse.json(
        { error: "Chasse au trésor introuvable" },
        { status: 404 },
      );
    }

    if (hunt.createdBy?.email !== session.user.email) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier cette chasse" },
        { status: 403 },
      );
    }

    const updatedHunt = await prisma.treasureHunt.update({
      where: { id },
      data: { status },
    });

    if (status === "IN_PROGRESS") {
    }

    return NextResponse.json(updatedHunt);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut" },
      { status: 500 },
    );
  }
}
