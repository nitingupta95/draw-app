import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const chats = await prisma.chat.findMany({
        orderBy: { createdAt: 'asc' }
    });
    
    const sortedMessages = chats;
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
            } else if (messageData.updateShape && messageData.updateShape.id) {
                const shape = shapesMap.get(messageData.updateShape.id);
                if (shape) {
                    Object.assign(shape, messageData.updateShape);
                }
            }
        } catch (e) {
            // ignore
        }
    }
    
    console.log("Shapes count:", shapesMap.size);
    // Also find an eraseId and see if the shape is in the map
    const eraseIds = chats.map(c => {
        try {
            return JSON.parse(c.message).eraseId;
        } catch(e) { return null; }
    }).filter(Boolean);
    
    console.log("Erased IDs:", eraseIds);
    for (const id of eraseIds) {
        console.log(`Is erased shape ${id} in map?`, shapesMap.has(id));
    }
}
main();
