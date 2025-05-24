import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PATCH(
  request: NextRequest,
<<<<<<< HEAD
  { params }: { params: Promise<{ id: string }> },
=======
  { params }: { params: { id: string } },
>>>>>>> 3993606 (.)
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

<<<<<<< HEAD
    const { id } = await params;
=======
    const { id } = params;
>>>>>>> 3993606 (.)
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: "You are not authorized to update this user" },
        { status: 403 },
      );
    }

    const body = await request.json();
<<<<<<< HEAD
    const { name, email, nickname, image } = body;
=======
    const { name, email, image } = body;
>>>>>>> 3993606 (.)

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
<<<<<<< HEAD
        nickname,
=======
>>>>>>> 3993606 (.)
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
