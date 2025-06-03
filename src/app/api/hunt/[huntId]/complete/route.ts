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
        participants: true,
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
        { error: "You don't have permission to complete this hunt" },
        { status: 403 },
      );
    }

    if (hunt.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Hunt can only be completed from IN_PROGRESS status" },
        { status: 400 },
      );
    }

    const updatedHunt = await prisma.treasureHunt.update({
      where: { id: huntId },
      data: {
        status: "COMPLETED",
        isFinished: true,
      },
    });

    return NextResponse.json(updatedHunt);
  } catch (error) {
    console.error("Error completing hunt:", error);
    return NextResponse.json(
      { error: "Failed to complete hunt" },
      { status: 500 },
    );
  }
}
