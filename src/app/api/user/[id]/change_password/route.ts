import bcrypt from "bcrypt";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (session.user.id !== id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à mettre à jour ce compte" },
        { status: 403 },
      );
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Veuillez fournir l'ancien et le nouveau mot de passe" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Mot de passe non valide dans la base de données" },
        { status: 500 },
      );
    }

    const isOldPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.password,
    );

    if (!isOldPasswordCorrect) {
      console.log("L'ancien mot de passe est incorrect.");
      return NextResponse.json(
        { error: "L'ancien mot de passe est incorrect" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    console.log("Utilisateur mis à jour:", updatedUser);

    return NextResponse.json({
      message: "Mot de passe mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur dans la mise à jour du mot de passe:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la mise à jour du mot de passe",
      },
      { status: 500 },
    );
  }
}
