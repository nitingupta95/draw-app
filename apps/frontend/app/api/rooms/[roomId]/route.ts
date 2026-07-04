import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@repo/db/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const room = await prismaClient.room.findUnique({
      where: { slug: roomId },
    });

    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    const messages = await prismaClient.chat.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "desc" },
      take: 100, // Fetch latest 100 messages
    });

    return NextResponse.json({ room, messages });
  } catch (error: any) {
    console.error("Error fetching room:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
