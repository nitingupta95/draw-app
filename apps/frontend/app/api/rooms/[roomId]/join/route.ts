import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@repo/db/client";
import { authenticate } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const userId = authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { roomId } = await params;
    const body = await req.json();
    const { passcode } = body;

    if (typeof passcode !== "string") {
      return NextResponse.json({ message: "Passcode is required" }, { status: 400 });
    }

    const room = await prismaClient.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    if (room.passcode !== passcode) {
      return NextResponse.json({ message: "Invalid passcode" }, { status: 403 });
    }

    // Add user as collaborator with default view-only permission
    await prismaClient.collaborator.upsert({
      where: { roomId_userId: { roomId: roomId, userId: userId } },
      create: { roomId: roomId, userId: userId, canEdit: false },
      update: {},
    });

    return NextResponse.json({ message: "Successfully joined room" });
  } catch (error: any) {
    console.error("Error joining room:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
