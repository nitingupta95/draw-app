import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages = res.data.messages;

    const shapes: any[] = [];
    const erasedIds = new Set<string>();

    // Messages are ordered by id desc (newest first). Let's process them properly
    // or just sort them oldest first
    const sortedMessages = messages.sort((a: any, b: any) => a.id - b.id);

    for (const x of sortedMessages) {
        try {
            const messageData = JSON.parse(x.message);
            if (messageData.erase && Array.isArray(messageData.erase)) {
                messageData.erase.forEach((id: string) => erasedIds.add(id));
            } else if (messageData.shape && messageData.shape.id) {
                shapes.push(messageData.shape);
            }
        } catch (e) {
            // ignore invalid json
        }
    }

    return shapes.filter(s => !erasedIds.has(s.id));
}