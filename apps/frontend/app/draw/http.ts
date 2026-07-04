import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages = res.data.messages;

    const shapes: any[] = [];
    const erasedIds = new Set<string>();

    const sortedMessages = messages;
    const shapesMap = new Map<string, any>();

    for (const x of sortedMessages) {
        try {
            const messageData = JSON.parse(x.message);
            if (messageData.erase && Array.isArray(messageData.erase)) {
                messageData.erase.forEach((id: string) => shapesMap.delete(id));
            } else if (messageData.eraseId) {
                shapesMap.delete(messageData.eraseId);
            } else if (messageData.shape && messageData.shape.id) {
                shapesMap.set(messageData.shape.id, messageData.shape);
            } else if (messageData.updateId && messageData.updates) {
                const shape = shapesMap.get(messageData.updateId);
                if (shape) {
                    Object.assign(shape, messageData.updates);
                }
            } else if (messageData.reorder) {
                const newMap = new Map<string, any>();
                for (const id of messageData.reorder) {
                    if (shapesMap.has(id)) {
                        newMap.set(id, shapesMap.get(id));
                        shapesMap.delete(id);
                    }
                }
                for (const [id, shape] of shapesMap.entries()) {
                    newMap.set(id, shape);
                }
                shapesMap.clear();
                for (const [id, shape] of newMap.entries()) {
                    shapesMap.set(id, shape);
                }
            }
        } catch (e) {
            // ignore invalid json
        }
    }

    return Array.from(shapesMap.values());

}
