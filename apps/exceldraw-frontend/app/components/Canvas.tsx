"use client"
import { useEffect, useRef } from "react";
import { initDraw } from "@/app/draw";
export function Canvas({roomId, socket}:{roomId:string, socket: WebSocket}){
    const Canvasref = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        if (Canvasref.current) {
            initDraw(Canvasref.current, roomId, socket);
        }
    }, [roomId]); 
    
    return (
        <div>
        <canvas ref={Canvasref} width={1080} height={1000}></canvas>
            <div className="absolute bottom-0 right-0">
                <button className="bg-white text-black">Rectangle</button>
                <br />
                <button className="bg-white text-black">Circle</button>
            </div>
            </div>
    )
}