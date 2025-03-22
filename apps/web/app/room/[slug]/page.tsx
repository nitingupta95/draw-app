import axios from "axios";
import { BACKEND_URL } from "../../config";
import  {ChatRoom}  from "../../../component/ChatRoom";


async function getRoom(slug: string) {
  const response = await axios.get(`${BACKEND_URL}/room/${slug}`);
  return response.data.room.id; 
}

export default async function ChatRoom1({
  params,
}: {
  params: {
    slug: string; 
  }
}) {
  const slug = (await params).slug;

  try {
    const roomId = await getRoom(slug);

     
    console.log("Room ID:", roomId);

     
    return (
      <div>
        <h1>Chat Room</h1>
        <p>Room ID: {roomId}</p>
        <ChatRoom id={roomId} ></ChatRoom>
         
      </div>
    );
  } catch (error) {
    console.error("Error fetching room:", error);
    return (
      <div>
        <h1>Error</h1>
        <p>Failed to load the chat room.</p>
      </div>
    );
  }
}
