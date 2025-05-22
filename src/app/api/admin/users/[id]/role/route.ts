import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

const roleSchema = z.object({
  role: z.enum(["PLAYER", "ORGANIZER", "ADMIN"] as const),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    const { id } = params;
    const body = await req.json();

    const validatedData = roleSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid role provided" },
        { status: 400 },
      );
    }

    const { role } = validatedData.data;

    if (id === session.user.id && role !== "ADMIN") {
      return NextResponse.json(
        { error: "You cannot demote yourself from admin" },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch {
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 },
    );
  }
}
