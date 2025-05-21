import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { z } from "zod";

const purchaseSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().min(1).default(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = purchaseSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors },
        { status: 400 }
      );
    }

    const { itemId, quantity } = validatedData.data;

    const shopItem = await prisma.shopItem.findUnique({
      where: { id: itemId, isActive: true },
    });

    if (!shopItem) {
      return NextResponse.json(
        { error: "Article non disponible" },
        { status: 404 }
      );
    }

    const totalPrice = shopItem.price * quantity;

    const userCurrency = await prisma.virtualCurrency.findFirst({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    if (!userCurrency || userCurrency.amount < totalPrice) {
      return NextResponse.json(
        { error: "Solde insuffisant" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transactionHistory.create({
        data: {
          userId: session.user.id,
          amount: totalPrice,
          transactionType: "SPENT",
          description: `Achat: ${quantity}x ${shopItem.name}`,
          virtualCurrencyId: userCurrency.id,
        },
      });

      await tx.virtualCurrency.update({
        where: { id: userCurrency.id },
        data: { amount: userCurrency.amount - totalPrice },
      });

      let expiresAt = null;
      if (shopItem.type === "BOOST") {
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }

      const userItem = await tx.userItem.create({
        data: {
          userId: session.user.id,
          itemId: shopItem.id,
          quantity,
          expiresAt,
        },
      });

      return { transaction, userItem };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'achat:", error);
    return NextResponse.json(
      { error: "Une erreur s'est produite lors de l'achat" },
      { status: 500 }
    );
  }
}