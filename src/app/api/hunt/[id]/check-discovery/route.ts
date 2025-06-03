import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    const { stepId, latitude, longitude, distance } = await request.json();

    const existingDiscovery = await prisma.stepDiscovery.findUnique({
      where: {
        userId_stepId: {
          userId: session.user.id,
          stepId,
        },
      },
    });

    if (existingDiscovery) {
      return NextResponse.json({
        success: false,
        message: "Déjà découvert",
      });
    }

    const discovery = await prisma.stepDiscovery.create({
      data: {
        userId: session.user.id,
        stepId,
        latitude,
        longitude,
        distance: Math.round(distance),
      },
    });

    return NextResponse.json({
      success: true,
      discovery,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
