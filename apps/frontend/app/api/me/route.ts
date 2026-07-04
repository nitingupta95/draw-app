import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@repo/db/client";
import { authenticate } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized: No userId found" }, { status: 403 });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: { 
        rooms: {
          include: {
            admin: true,
            collaborators: { include: { user: true } }
          }
        },
        collaborators: {
          include: {
            room: {
              include: {
                admin: true,
                collaborators: { include: { user: true } }
              }
            }
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user;
    
    const allRooms = [
      ...user.rooms,
      ...user.collaborators.map(c => c.room)
    ];
    const uniqueRooms = Array.from(new Map(allRooms.map(r => [r.id, r])).values());

    return NextResponse.json({ user: userWithoutPassword, rooms: uniqueRooms });
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
