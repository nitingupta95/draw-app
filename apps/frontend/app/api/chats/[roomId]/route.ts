import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@repo/db/client";
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const messages = await prismaClient.chat.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ message: "Internal server error while fetching chats" }, { status: 500 });
  }
}
