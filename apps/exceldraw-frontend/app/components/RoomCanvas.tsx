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
                setSocket(ws);
                ws.send(JSON.stringify({ type: "join_room", roomId }));
                
            };
        
            ws.onmessage = (event) => {
                console.log("📩 Message received from server:", event.data);
            };
        
            ws.onerror = (error) => {
                console.error("❌ WebSocket error:", error);
            };
        }, [roomId]);
        
         

     

    if (!socket) {
        return <div>Connecting to the server...</div>;
    }

    return (
        <div>
            <Canvas roomId={roomId} socket={socket} />
         </div>
    );
}
