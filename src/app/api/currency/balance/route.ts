import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const virtualCurrency = await prisma.virtualCurrency.findFirst({
      where: { userId },
      select: {
        amount: true,
        updatedAt: true,
      },
    });

    if (!virtualCurrency) {
      return NextResponse.json({
        amount: 0,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      amount: virtualCurrency.amount,
      updatedAt: virtualCurrency.updatedAt.toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch currency data" },
      { status: 500 },
    );
  }
}
