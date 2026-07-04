import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@repo/db/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    const user = await prismaClient.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({});
    }

    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (error: any) {
    console.error("Error finding user:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
