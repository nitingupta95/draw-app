import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
import { middleware } from "./middleware.js";
import { JWT_SECRET } from "@repo/backend-common/config";
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
app.use(cors({
  origin: 'http://localhost:8000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Signup Route
//@ts-ignore
app.post("/signup", async (req: Request, res: Response) => {
  const parseResult = CreateUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid format", error: parseResult.error.issues });
  }
  const { username, password, firstName, lastName } = parseResult.data;

  try {
    const existingUser = await prismaClient.user.findUnique({
      where: { email: username },
    });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: { email: username, password: hashedPassword, name: `${firstName} ${lastName}`, photo: "" },
    });
    res.status(201).json({ message: "User signed up successfully", userId: user.id });
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    res.status(500).json({
      message: "An error occurred while creating the user",
      error: error.message || "Unknown error",
    });
  }
}
);

// Signin Route
//@ts-ignore
app.post("/signin", async (req: Request, res: Response) => {

  const parseResult = signinSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid format", error: parseResult.error.issues });
  }
  const { username, password } = parseResult.data;

  try {
    const user = await prismaClient.user.findUnique({ where: { email: username }, include: { rooms: true } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = Jwt.sign({ userId: user.id }, JWT_SECRET);

    res.cookie("token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/"
    });

    res.json({ user, token });
  } catch (error: any) {
    console.error("Error signing in user:", error);
    res.status(500).json({ message: "Internal server error during signin", error: error.message });
  }
}
);

//@ts-ignore
app.post("/room", middleware, async (req: Request, res: Response) => {
  const parseResult = CreateRoomSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid Input", error: parseResult.error.issues });
  }

  const adminId = req.userId;
  if (!adminId) {
    return res.status(403).json({ message: "User not authorized" });
  }

  try {
    // Generate unique slug
    let slug = parseResult.data.name.toLowerCase().replace(/\s+/g, "-");
    let counter = 1;
    let existingRoom = await prismaClient.room.findUnique({ where: { slug } });

    while (existingRoom) {
      slug = `${parseResult.data.name.toLowerCase().replace(/\s+/g, "-")}-${counter}`;
      counter++;
      existingRoom = await prismaClient.room.findUnique({ where: { slug } });
    }

    // Generate unique 6 character passcode
    const passcode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create the new room
    const room = await prismaClient.room.create({
      data: {
        //@ts-ignore
        name: parseResult.data.name,
        slug,
        adminId,
        passcode,
      },
    });

    res.status(201).json({
      message: "Room created",
      room
    });

  } catch (error: any) {
    console.error("Error creating room:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Room with this name already exists" });
    }
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


//@ts-ignore
//@ts-ignore
app.get("/me", middleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(403).json({ message: "Unauthorized: No userId found" });
    }

    console.log("Fetching user for userId:", req.userId);

    const user = await prismaClient.user.findUnique({
      where: { id: req.userId },
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
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    
    const allRooms = [
      ...user.rooms,
      ...user.collaborators.map(c => c.room)
    ];
    const uniqueRooms = Array.from(new Map(allRooms.map(r => [r.id, r])).values());

    res.json({ user: userWithoutPassword, rooms: uniqueRooms });
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


//@ts-ignore
app.get("/chats/:roomId", async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const messages = await prismaClient.chat.findMany({
      where: { roomId },
      orderBy: { id: "desc" },
    });

    res.json({ messages });
  } catch (error: any) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Internal server error while fetching chats" });
  }
});


//@ts-ignore

app.get("/rooms/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;

  try {
    const room = await prismaClient.room.findUnique({
      where: { slug },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const messages = await prismaClient.chat.findMany({
      where: { roomId: room.id },
      orderBy: { id: "desc" },
      take: 100, // Fetch latest 100 messages
    });

    res.json({ room, messages }); // Return room + messages
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ message: "Failed to fetch room data" });
  }
});


app.get("/rooms/:roomId/details", middleware, async (req: Request, res: Response): Promise<void> => {
  const roomId = req.params.roomId;
  try {
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
      res.status(404).json({ message: "Room not found" });
      return;
    }

    res.json({ room });
  } catch (error) {
    console.error("Error fetching room details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.post("/find-user", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await prismaClient.user.findUnique({ where: { email } });

    if (!user) {
      res.json({});
      return;
    }

    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (error: any) {
    console.error("Error finding user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/rooms/:roomId/join", middleware, async (req: Request, res: Response): Promise<void> => {
  const roomId = req.params.roomId as string;
  const { passcode } = req.body;
  const userId = req.userId as string;

  if (!userId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  if (typeof passcode !== "string") {
    res.status(400).json({ message: "Passcode is required" });
    return;
  }

  try {
    const room = await prismaClient.room.findUnique({ where: { id: roomId } });
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    if (room.passcode !== passcode) {
      res.status(403).json({ message: "Invalid passcode" });
      return;
    }

    // Add user as collaborator with default view-only permission (or edit if you prefer. We'll set canEdit: false for link joiners to be safe, but since this is for general join, we'll default to false)
    await prismaClient.collaborator.upsert({
      where: { roomId_userId: { roomId: roomId, userId: userId } },
      create: { roomId: roomId, userId: userId, canEdit: false },
      update: {},
    });

    res.json({ message: "Successfully joined room" });
  } catch (error: any) {
    console.error("Error joining room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/rooms/:roomId/collaborators", middleware, async (req: Request, res: Response): Promise<void> => {
  const roomId = req.params.roomId;

  if (!roomId) {
    res.status(400).json({ message: "roomId is required" });
    return;
  }

  const { userId, canEdit } = req.body;

  if (!req.userId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  try {
    const room = await prismaClient.room.findUnique({ where: { id: roomId } });
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    if (room.adminId !== req.userId) {
      res.status(403).json({ message: "Only admin can add collaborators" });
      return;
    }

    await prismaClient.collaborator.upsert({
      where: { roomId_userId: { roomId, userId } },
      create: { roomId, userId, canEdit: canEdit ?? true },
      update: { canEdit: canEdit ?? true },
    });

    res.json({ message: "Collaborator added successfully" });
    return;
  } catch (error: any) {
    console.error("Error adding collaborator:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

app.get(
  "/rooms/:value/access",
  middleware,
  async (req: Request, res: Response): Promise<void> => {
    const value = req.params.value;

    try {
      // Try by id
      let room = await prismaClient.room.findUnique({ where: { id: value } });

      // Try by slug
      if (!room) {
        room = await prismaClient.room.findUnique({ where: { slug: value } });
      }

      if (!room) {
        res.status(404).json({ message: "Room not found" });
        return;
      }

      // Admin always allowed
      if (room.adminId === req.userId) {
        res.json({ ok: true, role: "admin" });
        return;
      }

      // Check collaborator
      const collaborator = await prismaClient.collaborator.findFirst({
        where: { roomId: room.id, userId: req.userId },
      });

      if (collaborator) {
        res.json({ ok: true, role: "collaborator", canEdit: collaborator.canEdit });
        return;
      }

      // Block everyone else
      res.status(403).json({ message: "Forbidden" });
    } catch (error: any) {
      console.error("Error checking room access:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);




// Start server
app.listen(4000, () => console.log("Server is running on http://localhost:4000"));
