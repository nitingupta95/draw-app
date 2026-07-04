import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@repo/db/client";
import { CreateUserSchema } from "@repo/common/types";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = CreateUserSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({ message: "Invalid format", error: parseResult.error.issues }, { status: 400 });
    }
    
    const { username, password, firstName, lastName } = parseResult.data;

    const existingUser = await prismaClient.user.findUnique({
      where: { email: username },
    });
    
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: { email: username, password: hashedPassword, name: `${firstName} ${lastName}`, photo: "" },
    });
    
    return NextResponse.json({ message: "User signed up successfully", userId: user.id }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 });
    }
    return NextResponse.json({
      message: "An error occurred while creating the user",
      error: error.message || "Unknown error",
    }, { status: 500 });
  }
}
