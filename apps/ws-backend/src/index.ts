import { WebSocketServer, WebSocket, RawData } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8088 });

interface UserConnection {
    ws: WebSocket;
    rooms: string[];
    userId: string;
}

let users: UserConnection[] = [];

/* -------------------------------------------------------------------------- */
/*                          TOKEN VALIDATION (JWT)                            */
/* -------------------------------------------------------------------------- */

function validateToken(token: string): string | null {
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        return decoded?.userId || null;
    } catch {
        return null;
    }
}

/* -------------------------------------------------------------------------- */
/*                          WEBSOCKET CONNECTION START                        */
/* -------------------------------------------------------------------------- */

wss.on("connection", async function connection(ws: WebSocket, request) {
    console.log("🌐 Incoming WebSocket connection...");

    // Extract token
    const url = request.url;
    if (!url) {
        ws.close(1008, "Invalid request");
        return;
    }

    const params = new URLSearchParams(url.split("?")[1]);
    const token = params.get("token") || "";

    const userId = validateToken(token);
    if (!userId) {
        ws.close(1008, "Invalid token");
        return;
    }

    console.log(`✅ Authenticated WebSocket user: ${userId}`);

    users.push({ userId, rooms: [], ws });

    /* ---------------------------------------------------------------------- */
    /*                              MESSAGE HANDLER                            */
    /* ---------------------------------------------------------------------- */

    ws.on("message", async (data: RawData) => {
        try {
            const parsed = JSON.parse(data.toString());
            const roomId: string = String(parsed.roomId); // ALWAYS STRING

            /* ------------------------------ JOIN ROOM ----------------------------- */
            if (parsed.type === "join_room") {
                console.log(`➡️ join_room request user=${userId} room=${roomId}`);

                const isCollaborator = await prismaClient.collaborator.findFirst({
                    where: { roomId, userId }
                });

                const isAdmin = await prismaClient.room.findFirst({
                    where: { id: roomId, adminId: userId }
                });

                if (!isCollaborator && !isAdmin) {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "You are not allowed to join this room"
                    }));
                    return;
                }

                const user = users.find((u) => u.ws === ws);
                if (user && !user.rooms.includes(roomId)) {
                    user.rooms.push(roomId);
                }

                console.log(`👥 User ${userId} joined room ${roomId}`);
                return;
            }

            /* ------------------------------ LEAVE ROOM ---------------------------- */
            if (parsed.type === "leave_room") {
                const user = users.find((u) => u.ws === ws);
                if (user) {
                    user.rooms = user.rooms.filter((r) => r !== roomId);
                }
                console.log(`🏃 User ${userId} left room ${roomId}`);
                return;
            }

            /* ------------------------------- DRAW / CHAT --------------------------- */
            if (parsed.type === "chat") {
                const { message } = parsed;

                // Validate user exists
                const dbUser = await prismaClient.user.findUnique({
                    where: { id: userId }
                });
                if (!dbUser) {
                    ws.send(JSON.stringify({ type: "error", message: "Unauthorized user" }));
                    return;
                }

                // Validate room
                const dbRoom = await prismaClient.room.findUnique({
                    where: { id: roomId }
                });
                if (!dbRoom) {
                    ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
                    return;
                }

                // Check if user can edit room
                const isCollaborator = await prismaClient.collaborator.findFirst({
                    where: { roomId, userId }
                });

                const isAdmin = dbRoom.adminId === userId;

                if (!isAdmin && !isCollaborator) {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "You are not allowed to edit this room"
                    }));
                    return;
                }

                // Save drawing/chat event
                await prismaClient.chat.create({
                    data: {
                        roomId,
                        message,
                        userId
                    }
                });

                console.log(`💬 Saved drawing for room ${roomId}`);

                // Broadcast to all room members
                users.forEach((u) => {
                    if (u.rooms.includes(roomId)) {
                        u.ws.send(JSON.stringify({
                            type: "chat",
                            message,
                            roomId
                        }));
                    }
                });

                console.log(`📡 Broadcasted drawing to room ${roomId}`);
                return;
            }

        } catch (err) {
            console.error("❌ WebSocket Error:", err);
            ws.send(JSON.stringify({ type: "error", message: "Invalid WebSocket request" }));
        }
    });

    /* ---------------------------------------------------------------------- */
    /*                          DISCONNECT HANDLER                             */
    /* ---------------------------------------------------------------------- */

    ws.on("close", () => {
        console.log(`❌ User disconnected: ${userId}`);
        users = users.filter((u) => u.ws !== ws);
    });

    /* ---------------------------------------------------------------------- */
    /*                         HEARTBEAT KEEP ALIVE                            */
    /* ---------------------------------------------------------------------- */

    const keepAlive = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
        }
    }, 25000);

    ws.on("close", () => clearInterval(keepAlive));
});

console.log("🚀 WebSocket Server running on ws://localhost:8080");
