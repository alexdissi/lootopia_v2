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

    const shopItems = await prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    return NextResponse.json(shopItems);
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error);
    return NextResponse.json(
      {
        error: "Une erreur s'est produite lors de la récupération des articles",
      },
      { status: 500 },
    );
  }
}
