import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@repo/db/client";
import { authenticate } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const userId = authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "User not authorized" }, { status: 403 });
    }

    const { roomId } = await params;
    const room = await prismaClient.room.findUnique({
      where: { id: roomId },
      include: {
        admin: true,
        collaborators: {
          include: {
            user: true,
          }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error: any) {
    console.error("Error fetching room details:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
