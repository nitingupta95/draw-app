import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@repo/db/client";
import { signinSchema } from "@repo/common/types";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = signinSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({ message: "Invalid format", error: parseResult.error.issues }, { status: 400 });
    }
    
    const { username, password } = parseResult.data;

    const user = await prismaClient.user.findUnique({ where: { email: username }, include: { rooms: true } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = Jwt.sign({ userId: user.id }, JWT_SECRET);

    const response = NextResponse.json({ user, token });
    
    response.cookies.set("token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/"
    });

    return response;
  } catch (error: any) {
    console.error("Error signing in user:", error);
    return NextResponse.json({ message: "Internal server error during signin", error: error.message }, { status: 500 });
  }
}
