import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
 try {
      const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    } 
    
    const { userId } = await params;
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to update this user" },
        { status: 403 },
      );
    }
    console.log("userId", userId);
    console.log("session.user.id", session.user.id);
    const body = await request.json();
    const { name, email, image} = body;

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            name,
            email,
            image,
        },
        });

    return NextResponse.json({
        message: "User updated successfully",
        user: updatedUser
    })  
 } catch{
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }
 }

