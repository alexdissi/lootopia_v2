import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { huntId: string } },
) {
  try {
    const { huntId } = params;

    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const hunt = await prisma.treasureHunt.findUnique({
      where: { id: huntId },
      select: {
        createdById: true,
        status: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!hunt) {
      return NextResponse.json({ error: "Hunt not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (hunt.createdById !== session.user.id && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to start this hunt" },
        { status: 403 },
      );
    }

    if (hunt.status !== "PENDING") {
      return NextResponse.json(
        { error: "Hunt can only be started from PENDING status" },
        { status: 400 },
      );
    }

    const now = new Date();
    const startDate = hunt.startDate || now;
    const endDate = hunt.endDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Par défaut : 30 jours à partir de maintenant

    const updatedHunt = await prisma.treasureHunt.update({
      where: { id: huntId },
      data: {
        status: "IN_PROGRESS",
        startDate,
        endDate,
      },
    });

    return NextResponse.json(updatedHunt);
  } catch (error) {
    console.error("Error starting hunt:", error);
    return NextResponse.json(
      { error: "Failed to start hunt" },
      { status: 500 },
    );
  }
}
