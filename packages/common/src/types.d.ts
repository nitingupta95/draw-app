import { z } from "zod";
export declare const CreateUserSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
}, {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
}>;
export declare const signinSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export declare const CreateRoomSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
//# sourceMappingURL=types.d.ts.map