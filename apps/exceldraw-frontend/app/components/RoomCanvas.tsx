"use client";

import { useEffect, useRef, useState } from "react";
import { WS_URl } from "@/config";
import { Canvas } from "./Canvas";

export default function RoomCanvas({ roomId }: { roomId: string }) {
    const Canvasref = useRef<HTMLCanvasElement>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);


   

        useEffect(() => {
            if (!roomId) return;

            const token = localStorage.getItem("Authorization");
            if (!token) {
                console.error("❌ No token found in localStorage!");
                return;
            }
            console.log(`🛜 Trying to connect to WebSocket: ${WS_URl}`);
            
            const ws = new WebSocket(`${WS_URl}?token=${token}`);
        
            ws.onopen = () => {
                console.log(`✅ Joined room: ${roomId}`);
                ws.send(JSON.stringify({ type: "join_room", roomId }));
                setSocket(ws);
            };
        
            ws.onmessage = (event) => {
                console.log("📩 Message received from server:", event.data);
            };
        
            ws.onerror = (error) => {
                console.error("❌ WebSocket error:", error);
            };
        }, [roomId]);
        
        const sendMessage = (message: string) => {
            console.log("📤 Trying to send message...");
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                console.warn("⚠️ WebSocket is not open. Cannot send message.");
                return;
            }
            const payload = { type: "chat", roomId, message };
            console.log("📤 Sending message:", payload);
            socket.send(JSON.stringify(payload));
        };
        

     

    if (!socket) {
        return <div>Connecting to the server...</div>;
    }

    return (
        <div>
            <Canvas roomId={roomId} socket={socket} />
            <button onClick={() => sendMessage("Hello from frontend!")}>Send Message</button>
        </div>
    );
}
