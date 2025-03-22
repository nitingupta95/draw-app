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

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string" || !decoded || !decoded.userId) {
      return null;
    }
    return decoded.userId;
  } catch (err) {
    return null;
  }
}

wss.on("connection", function connection(ws: WebSocket, request) {
  const url = request.url;
  if (!url) return;

  // Extract token from the query parameters
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const userId = checkUser(token);
  if (!userId) {
    ws.close(1008, "Invalid or missing token");
    return;
  }

  users.push({ userId, rooms: [], ws });

  ws.on("message", async function message(data: RawData) {
    try {
      const messageString = data.toString(); // Convert RawData (Buffer) to string
      const parsedData = JSON.parse(messageString);

      console.log("Message received:", parsedData);

      if (parsedData.type === "join_room") {
        const user = users.find((x) => x.ws === ws);
        if (user) user.rooms.push(parsedData.roomId);
      }

      if (parsedData.type === "leave_room") {
        const user = users.find((x) => x.ws === ws);
        if (user) {
          user.rooms = user.rooms.filter((room) => room !== parsedData.roomId);
        }
      }

      if (parsedData.type === "chat") {
        const roomId = Number(parsedData.roomId); // Convert roomId to number
        const message = parsedData.message;

        // Validate room existence
        const room = await prismaClient.room.findUnique({ where: { id: roomId } });
        if (!room) {
          ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
          return;
        }

        // Save chat to database
        await prismaClient.chat.create({
          data: {
            roomId,
            message,
            userId,
          },
        });

        // Broadcast message to users in the same room
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

        console.log("Message sent to room:", roomId, "Message:", message);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON format" }));
    }
  });
});
