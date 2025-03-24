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

// ✅ Function to verify JWT token
function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return typeof decoded === "string" || !decoded?.userId ? null : decoded.userId;
    } catch (err) {
        return null;
    }
}

wss.on("connection", function connection(ws: WebSocket, request) {
    console.log("New WebSocket connection attempt...");

    // ✅ Parse query params
    const url = request.url;
    if (!url) {
        console.log("❌ Rejected: No URL provided");
        ws.close(1008, "No URL provided");
        return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token") || "";
    console.log("🔑 Token received:", token);

    const userId = checkUser(token);
    if (!userId) {
        console.log("❌ Rejected: Invalid token");
        ws.close(1008, "Invalid or missing token");
        return;
    }

    console.log(`✅ WebSocket connected: userId=${userId}`);
    users.push({ userId, rooms: [], ws });

    ws.on("message", async function message(data: RawData) {
        try {
            const messageString = data.toString();
            const parsedData = JSON.parse(messageString);

            console.log("📩 Message received:", parsedData);

            if (parsedData.type === "join_room") {
                console.log(`👥 User joined room: ${parsedData.roomId}`);
                const user = users.find((x) => x.ws === ws);
                if (user) user.rooms.push(parsedData.roomId);
            }

            if (parsedData.type === "leave_room") {
                console.log(`🏃 User left room: ${parsedData.roomId}`);
                const user = users.find((x) => x.ws === ws);
                if (user) {
                    user.rooms = user.rooms.filter((room) => room !== parsedData.roomId);
                }
            }

            if (parsedData.type === "chat") {
                const { roomId, message } = parsedData;
                console.log(`💬 Chat message received for room ${roomId}:`, message);

                // ✅ Check if room exists
                const room = await prismaClient.room.findUnique({ where: { id: Number(roomId) } });
                if (!room) {
                    ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
                    return;
                }

                // ✅ Save message to DB
                await prismaClient.chat.create({
                    data: {
                        roomId: Number(roomId),
                        message,
                        userId,
                    },
                });

                // ✅ Broadcast message to room
                users.forEach((user) => {
                    if (user.rooms.includes(parsedData.roomId)) {
                        user.ws.send(
                            JSON.stringify({
                                type: "chat",
                                message,
                                roomId,
                            })
                        );
                    }
                });

                console.log("✅ Message broadcasted to room:", roomId);
            }
        } catch (error) {
            console.error("❌ Error processing message:", error);
            ws.send(JSON.stringify({ type: "error", message: "Invalid JSON format" }));
        }
    });

    // ✅ Handle WebSocket disconnect
    ws.on("close", () => {
        console.log(`❌ Disconnected user: ${userId}`);
        users = users.filter((user) => user.ws !== ws);
    });

    // ✅ Heartbeat (Prevent Connection Timeout)
    setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
        }
    }, 30000);
});
