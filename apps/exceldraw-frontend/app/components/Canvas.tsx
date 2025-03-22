"use client"
import { useEffect, useRef, useState } from "react";
import { initDraw } from "@/app/draw";
export function Canvas({roomId, socket}:{roomId:string, socket: WebSocket}){
    const Canvasref = useRef<HTMLCanvasElement>(null);
    const [shape, setShape]= useState();
    
    useEffect(() => {
        if (Canvasref.current) {
            initDraw(Canvasref.current, roomId, socket, shape);
        }
    }, [roomId]); 


    function setRectangle(){
        setShape(rect);
    }

    
    return (
        <div>
        <canvas ref={Canvasref} width={1080} height={1000}></canvas>
            <div className="absolute bottom-0 right-0">
                <button className="bg-white text-black" onClick={setRectangle}>Rectangle</button>
                <br />
                <button className="bg-white text-black" onClick={()=>setShape(circle)}>Circle</button>
            </div>
            </div>
    )
}