import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const chats = await prisma.chat.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' }
    });
    console.log(chats.map(c => c.message));
}
main();
