import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const hunt = await prisma.treasureHunt.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { stepOrder: "asc" },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    if (!hunt) {
      return NextResponse.json({ error: "Hunt not found" }, { status: 404 });
    }

    return NextResponse.json(hunt);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch hunt details" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    const body = await req.json();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const hunt = await prisma.treasureHunt.findUnique({
      where: { id: params.id },
      select: { createdById: true },
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
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.treasureHunt.update({
        where: { id: params.id },
        data: {
          title: body.title,
          description: body.description,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
          location: body.location,
          mode: body.mode,
          fee: body.fee,
          mapStyle: body.mapStyle,
          status: body.status,
        },
      });

      if (body.steps) {
        await tx.huntStep.deleteMany({
          where: { huntId: params.id },
        });

        await tx.huntStep.createMany({
          data: body.steps.map((step: any) => ({
            description: step.description,
            huntId: params.id,
            stepOrder: step.stepOrder,
          })),
        });
      }
    });

    const updatedHunt = await prisma.treasureHunt.findUnique({
      where: { id: params.id },
      include: {
        steps: {
          orderBy: { stepOrder: "asc" },
        },
      },
    });

    return NextResponse.json(updatedHunt);
  } catch {
    return NextResponse.json(
      { error: "Failed to update hunt" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const hunt = await prisma.treasureHunt.findUnique({
      where: { id: params.id },
      select: { createdById: true },
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
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    await prisma.$transaction([
      prisma.huntStep.deleteMany({ where: { huntId: params.id } }),
      prisma.participation.deleteMany({ where: { huntId: params.id } }),
      prisma.treasureHunt.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete hunt" },
      { status: 500 },
    );
  }
}
