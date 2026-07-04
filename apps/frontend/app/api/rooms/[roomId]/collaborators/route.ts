import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@repo/db/client";
import { authenticate } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const adminId = authenticate(req);
    if (!adminId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { roomId } = await params;
    if (!roomId) {
      return NextResponse.json({ message: "roomId is required" }, { status: 400 });
    }

    const body = await req.json();
    const { userId, canEdit } = body;

    const room = await prismaClient.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    if (room.adminId !== adminId) {
      return NextResponse.json({ message: "Only admin can add collaborators" }, { status: 403 });
    }

    await prismaClient.collaborator.upsert({
      where: { roomId_userId: { roomId, userId } },
      create: { roomId, userId, canEdit: canEdit ?? true },
      update: { canEdit: canEdit ?? true },
    });

    return NextResponse.json({ message: "Collaborator added successfully" });
  } catch (error: any) {
    console.error("Error adding collaborator:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
