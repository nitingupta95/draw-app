import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      email: "user1@example.com",
      password: "password123",
      name: "User One",
      photo: "https://via.placeholder.com/150",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "user2@example.com",
      password: "password456",
      name: "User Two",
      photo: "https://via.placeholder.com/150",
    },
  });

  console.log("Users created:", user1, user2);

  // Create a Room
  const room = await prisma.room.create({
    data: {
      slug: "general-chat",
      adminId: user1.id, // User1 is the admin
    },
  });

  console.log("Room created:", room);

  // Create Chats
  const chat1 = await prisma.chat.create({
    data: {
      roomId: room.id,
      userId: user1.id,
      message: "Hello, this is my first message!",
    },
  });

  const chat2 = await prisma.chat.create({
    data: {
      roomId: room.id,
      userId: user2.id,
      message: "Hi there! Welcome to the chat room.",
    },
  });

  console.log("Chats created:", chat1, chat2);
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
