import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PATCH(
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

    const { id } = await params;
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: "You are not authorized to update this user" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, email, nickname, image } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        nickname,
        image,
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }
}
