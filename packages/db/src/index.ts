import { PrismaClient } from '@prisma/client';
export const prismaClient = new PrismaClient();



// async function main() {
//   const user = await prisma.user.create({
//     data: {
//       email: 'test@example.com',
//       password: 'password123',
//       name: 'Test User',
//       photo: 'https://example.com/photo.jpg',
//     },
//   });
//   console.log(user);
// }

// main().catch((e) => {
//   console.error(e);
//   process.exit(1);
// });
