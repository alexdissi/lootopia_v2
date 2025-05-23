import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

const huntSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  location: z.string().optional(),
  mode: z.enum(["PUBLIC", "PRIVATE"]),
  fee: z.number().min(0).optional(),
  mapStyle: z.string().optional(),
  steps: z.array(
    z.object({
      description: z.string(),
      stepOrder: z.number().int().min(1),
    }),
  ),
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== "ORGANIZER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validatedData = huntSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors },
        { status: 400 },
      );
    }

    const data = validatedData.data;

    const hunt = await prisma.$transaction(async (tx) => {
      const newHunt = await tx.treasureHunt.create({
        data: {
          title: data.title,
          description: data.description,
          createdById: session.user.id,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          location: data.location,
          mode: data.mode,
          fee: data.fee,
          mapStyle: data.mapStyle,
          status: "PENDING",
        },
      });

      if (data.steps && data.steps.length > 0) {
        await tx.huntStep.createMany({
          data: data.steps.map((step) => ({
            description: step.description,
            huntId: newHunt.id,
            stepOrder: step.stepOrder,
          })),
        });
      }

      return newHunt;
    });

    return NextResponse.json(hunt, { status: 201 });
  } catch (error) {
    console.error("Error creating treasure hunt:", error);
    return NextResponse.json(
      { error: "Failed to create treasure hunt" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const userOnly = searchParams.get("userOnly") === "true";

    let filters: any = {};

    if (status) {
      filters.status = status;
    }

    if (userOnly) {
      filters.createdById = session.user.id;
    } else {
      filters = {
        OR: [
          {
            status: "PENDING",
            createdById: session.user.id,
          },
          {
            status: {
              not: "PENDING",
            },
          },
        ],
      };

      if (status) {
        filters = {
          AND: [{ status }, filters],
        };
      }
    }

    const hunts = await prisma.treasureHunt.findMany({
      where: filters,
      include: {
        steps: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(hunts);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch hunts" },
      { status: 500 },
    );
  }
}
