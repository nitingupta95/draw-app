import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@repo/db/client";
import { CreateRoomSchema } from "@repo/common/types";
import { authenticate } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userId = authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "User not authorized" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = CreateRoomSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({ message: "Invalid Input", error: parseResult.error.issues }, { status: 400 });
    }

    let slug = parseResult.data.name.toLowerCase().replace(/\s+/g, "-");
    let counter = 1;
    let existingRoom = await prismaClient.room.findUnique({ where: { slug } });

    while (existingRoom) {
      slug = `${parseResult.data.name.toLowerCase().replace(/\s+/g, "-")}-${counter}`;
      counter++;
      existingRoom = await prismaClient.room.findUnique({ where: { slug } });
    }

    const passcode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const room = await prismaClient.room.create({
      data: {
        //@ts-ignore
        name: parseResult.data.name,
        slug,
        adminId: userId,
        passcode,
      },
    });

    return NextResponse.json({
      message: "Room created",
      room
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating room:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Room with this name already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
