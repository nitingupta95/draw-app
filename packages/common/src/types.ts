
import {z} from "zod";

export const CreateUserSchema= z.object({
    username: z.string().email(),
    password: z.string().min(3).max(30),
    firstName: z.string().min(3).max(100),
    lastName: z.string().min(3).max(100),
})

export const signinSchema= z.object({
    username: z.string().email(),
    password: z.string(),
})

export const CreateRoomSchema= z.object({
    name:z.string().min(3).max(20),
})