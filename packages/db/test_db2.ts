import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const chats = await prisma.chat.findMany({
        where: {
            message: {
                contains: 'eraseId'
            }
        }
    });
    console.log(chats.length, "erase messages");
}
main();
