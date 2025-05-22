import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    console.log(await request.json());
return NextResponse.json({ message: "User updated successfully" }, { status: 200 });
}
