import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import { middleware } from "./middleware.js"; // Added .js extension
import { JWT_SECRET } from "@repo/backend-common/config"; // Updated to named import
import { prismaClient } from "@repo/db/client";
import {
  CreateUserSchema,
  signinSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import cors from "cors";
//@ts-ignore
const app = express();
app.use(express.json());
app.use(cors());

// Signup Route
//@ts-ignore
app.post("/signup", async (req: Request, res: Response) => {
    const parseResult = CreateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid format", error: parseResult.error.issues });
    }
    const { username, password, firstName, lastName } = parseResult.data;

    const existingUser = await prismaClient.user.findUnique({
      where: { email: username },
    });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await prismaClient.user.create({
        data: { email: username, password: hashedPassword, name: `${firstName} ${lastName}`, photo: "" },
      });
      res.status(201).json({ message: "User signed up successfully", userId: user.id });
    } catch (error: any) {
      console.error("Error creating user:", error);  
      res.status(500).json({
        message: "An error occurred while creating the user",
        error: error.message || "Unknown error",
      });
    }
  }
);

// Signin Route
//@ts-ignore
app.post("/signin",async (req: Request, res: Response) => {
  
    const parseResult = signinSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid format", error: parseResult.error.issues });
    }
    const { username, password } = parseResult.data;

    const user = await prismaClient.user.findUnique({ where: { email: username } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = Jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token });
  }
);

// Start server
 



// // Room Route
//@ts-ignore
app.post("/room", middleware, async (req: Request, res: Response) => {
  const parseResult = CreateRoomSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid Input", error: parseResult.error.issues });
  }
  const adminId = req.userId; 

  if (!adminId) {
    return res.status(403).json({ message: "User not authorized" }); // Handle case when userId is not found
  }

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parseResult.data.name,
        adminId: adminId, // Ensure adminId is a string, not undefined
        createdAt: new Date(),
      },
    });

    res.status(201).json({ message: "Room created", roomId: room.id });
  } catch (error:any) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Error creating room", error: error.message });
  }
});

 
//@ts-ignore
app.get("/chats/:roomId", async (req, res) => {
  // Debugging
  console.log("Request received for roomId:", req.params.roomId);
  try {
     
      const roomId = parseInt(req.params.roomId, 10);
      if (isNaN(roomId)) {
          return res.status(400).json({ message: "Invalid roomId" });
      }

    const messages = await prismaClient.chat.findMany({
      where: {
        roomId: roomId,
      },
      orderBy: {
        id: "desc",
      },
      take: 1000,
    });
    res.json({
      messages,
    });
  } catch (e:any) {
    console.error("Error:", e); // Debugging
    res.status(500).json({
      error: e.message,
    });
  }
});

//@ts-ignore
app.get("/rooms/:slug", async(req:Request, res:Response) => {
  const slug = req.params.slug;

  try {
    // Fetch the room using the slug
    const room = await prismaClient.room.findFirst({
      where: {
        slug: slug,
      },
    });

    // If room not found, return 404
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Fetch messages for the found room
    const messages = await prismaClient.chat.findMany({
      where: {
        roomId: room.id,  // Use the roomId from the room we found
      },
      orderBy: {
        id: "desc",  // Sort by ID in descending order
      },
      take: 50,  // Limit to the last 50 messages
    });

    // Return the messages as JSON response
    res.json(messages);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
});








// Start server
app.listen(5000, () => console.log("Server is running on http://localhost:5000"));
