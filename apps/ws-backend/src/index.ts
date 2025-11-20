import { WebSocketServer, WebSocket, RawData } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    ws: WebSocket;
    rooms: string[];
    userId: string;
}

let users: User[] = [];

// 🔐 Validate JWT Token
function checkUser(token: string): string | null {
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        return decoded?.userId || null;
    } catch {
        return null;
    }
}

wss.on("connection", function connection(ws: WebSocket, request) {
    console.log("🌐 New WebSocket connection attempt...");

    // Parse Token from Query Params
    const url = request.url;
    if (!url) {
        ws.close(1008, "No URL provided");
        return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token") || "";

    console.log("🔑 Token received:", token);

    const userId = checkUser(token);
    if (!userId) {
        console.log("❌ Invalid token. Closing connection.");
        ws.close(1008, "Invalid token");
        return;
    }

    console.log(`✅ WebSocket connected: userId=${userId}`);

    users.push({ userId, rooms: [], ws });

    // 📩 Handle Incoming Messages
    ws.on("message", async function message(data: RawData) {
        try {
            const parsed = JSON.parse(data.toString());
            console.log("📨 Message received:", parsed);

            // Join Room
            if (parsed.type === "join_room") {
                const user = users.find((u) => u.ws === ws);
                if (user && !user.rooms.includes(parsed.roomId)) {
                    user.rooms.push(parsed.roomId);
                }
                console.log(`👥 User ${userId} joined room ${parsed.roomId}`);
                return;
            }

            // Leave Room
            if (parsed.type === "leave_room") {
                const user = users.find((u) => u.ws === ws);
                if (user) {
                    user.rooms = user.rooms.filter((r) => r !== parsed.roomId);
                }
                console.log(`🏃 User ${userId} left room ${parsed.roomId}`);
                return;
            }

            // ✏️ Chat / Drawing Message
            if (parsed.type === "chat") {
                const { roomId, message } = parsed;

                // 1️⃣ Check if user exists in DB
                const dbUser = await prismaClient.user.findUnique({
                    where: { id: userId },
                });

                if (!dbUser) {
                    console.log(`❌ DB User not found: ${userId}`);
                    ws.send(JSON.stringify({ type: "error", message: "Unauthorized user" }));
                    return;
                }

                // 2️⃣ Check if room exists
                const dbRoom = await prismaClient.room.findUnique({
                    where: { id: Number(roomId) },
                });

                if (!dbRoom) {
                    ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
                    return;
                }

                // 3️⃣ Save chat/drawing event
                await prismaClient.chat.create({
                    data: {
                        roomId: Number(roomId),
                        message,
                        userId,
                    },
                });

                console.log(`💬 Chat saved in DB for room ${roomId}`);

                // 4️⃣ Broadcast to connected users in this room
                users.forEach((u) => {
                    if (u.rooms.includes(roomId)) {
                        u.ws.send(
                            JSON.stringify({
                                type: "chat",
                                message,
                                roomId,
                            })
                        );
                    }
                });

                console.log(`📡 Broadcast completed for room ${roomId}`);
            }
        } catch (err) {
            console.error("❌ Error handling WS message:", err);
            ws.send(JSON.stringify({ type: "error", message: "Invalid request" }));
        }
    });

    // 🚪 Handle Disconnect
    ws.on("close", () => {
        console.log(`❌ Disconnected user: ${userId}`);
        users = users.filter((u) => u.ws !== ws);
    });

    // ❤️ Heartbeat to prevent Heroku / Vercel timeout
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
        }
    }, 25000);

    ws.on("close", () => clearInterval(interval));
});
