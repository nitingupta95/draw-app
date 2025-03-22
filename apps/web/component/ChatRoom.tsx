import axios from "axios"
import { BACKEND_URL } from "../app/config"
import { ChatRoomclient } from "./ChatRoomClient";


async function getChat(roomId:string){
    const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    return response.data.messages;
}


export async function ChatRoom({id}:{
    id: string
}){
    const message = await getChat(id);
    return <ChatRoomclient id={id} messages={message}></ChatRoomclient>
}