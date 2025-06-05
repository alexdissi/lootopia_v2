import bcrypt from "bcrypt";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { message: "Authentification requise" },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (session.user.id !== id) {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 },
      );
    }

    const { oldPassword, newpassword } = await request.json();

    if (!oldPassword || !newpassword) {
      return NextResponse.json(
        { message: "Ancien et nouveau mot de passe requis" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    const userPassword = user.newpassword ?? "";

    const isOldPasswordCorrect = await bcrypt.compare(
      oldPassword,
      userPassword,
    );

    if (!isOldPasswordCorrect) {
      return NextResponse.json(
        { message: "Mot de passe incorrect" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        newpassword: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "Mot de passe mis à jour avec succès",
      user: updatedUser,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Une erreur est survenue lors de la mise à jour",
      },
      { status: 500 },
    );
  }
}
