import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userItems = await prisma.userItem.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [{ item: { type: "asc" } }, { createdAt: "desc" }],
    });

    const now = new Date();
    const expiredItems = userItems.filter(
      (item) =>
        item.expiresAt && new Date(item.expiresAt) < now && item.isActive,
    );

    if (expiredItems.length > 0) {
      Promise.all(
        expiredItems.map((item) =>
          prisma.userItem.update({
            where: { id: item.id },
            data: { isActive: false },
          }),
        ),
      ).catch((err) =>
        console.error(
          "Erreur lors de la désactivation des objets expirés:",
          err,
        ),
      );
    }

    const formattedUserItems = userItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      isActive: item.isActive,
      expiresAt: item.expiresAt ? item.expiresAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      item: {
        id: item.item.id,
        name: item.item.name,
        description: item.item.description,
        type: item.item.type,
        imageUrl: item.item.imageUrl,
      },
    }));

    return NextResponse.json(formattedUserItems);
  } catch {
    return NextResponse.json(
      {
        error:
          "Une erreur s'est produite lors de la récupération de vos articles",
      },
      { status: 500 },
    );
  }
}
