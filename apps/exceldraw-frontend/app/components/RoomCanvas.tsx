"use client";

import { useEffect, useRef, useState } from "react";
 
import { WS_URl } from "@/config";
import { Canvas } from "./Canvas";
export default function RoomCanvas({ roomId }: { roomId: string }) {
    const Canvasref = useRef<HTMLCanvasElement>(null);
    const [socket, setSocket]= useState<WebSocket |null>(null);

    useEffect(()=>{
        const ws= new WebSocket(`${WS_URl}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YjY4YmJlNC00ODhkLTQzYTItOGM0MS1hMjg3NWE4NWJmZGIiLCJpYXQiOjE3NDI1NDkzNjR9.kHy-z7kKtJrJwY6xrcATZQxChTkXUir-Zrp6kKQTr7o`);
        ws.onopen= ()=>{
            setSocket(ws);
            ws.send(JSON.stringify({
                type:"join_room",
                roomId
            }))
        }
    },[])
    

    
    if(!socket) {
        return<div>Connecting the server ...</div>
    }



    return (
        <div>
            <Canvas roomId={roomId} socket={socket}/>
        </div>
    );
}
