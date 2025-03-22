"use client"

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";


export function ChatRoomclient({
    messages,
    id
}:{
    messages:{message:string}[];
    id:string
}){
    const [chats, setChats]= useState(messages);
    const {socket,loading}= useSocket();
    const [currentMessage, setCurrentMessage]= useState("");
    useEffect(()=>{
        if(socket && !loading){
            socket.send(JSON.stringify({
                type:"join_room",
                roomId:id
            }))
            socket.onmessage=(e:any)=>{
               const parsedData=JSON.parse(e.data);
                if(parsedData.type==="chat"){
                    setChats(c=> [...c, {message.parsedData.message}]);
                }

            }
        }
    },[socket, loading, id])

    return <div> 
        {chats.map(m=><div>
            {m.message}
        </div>)}

        <input type="text" value={currentMessage}  onChange={(e)=>{setCurrentMessage(e.target.value)}}/>
        <button onClick={()=>{
            socket?.send(JSON.stringify({
                type:"chat",
                roomId:id,
                messages:currentMessage
            }))
            setCurrentMessage("");
        }}>Send Message</button>
    </div>
}