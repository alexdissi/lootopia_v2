import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { huntId: string } },
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    const { huntId } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const hunt = await prisma.treasureHunt.findUnique({
      where: { id: huntId },
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
  } catch (error) {
    console.error("Error fetching hunt:", error);
    return NextResponse.json(
      { error: "Failed to fetch hunt details" },
      { status: 500 },
    );
  }
}
