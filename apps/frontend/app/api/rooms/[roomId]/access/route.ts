import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@repo/db/client";
import { authenticate } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const room = await prismaClient.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    const userId = authenticate(req);
    
    if (!userId) {
      if (room.passcode) {
        return NextResponse.json({ message: "Passcode required" }, { status: 403 });
      }
      return NextResponse.json({ role: "viewer", canEdit: false });
    }

    if (room.adminId === userId) {
      return NextResponse.json({ role: "admin", canEdit: true });
    }

    const collaborator = await prismaClient.collaborator.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (collaborator) {
      return NextResponse.json({ role: "collaborator", canEdit: collaborator.canEdit });
    }

    if (room.passcode) {
      return NextResponse.json({ message: "Passcode required" }, { status: 403 });
    }

    return NextResponse.json({ role: "viewer", canEdit: false });

  } catch (error: any) {
    console.error("Error checking access:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
