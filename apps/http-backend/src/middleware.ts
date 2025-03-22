import { NextFunction, Request, Response } from "express";
import Jwt, { JwtPayload } from "jsonwebtoken";
 
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export function middleware (req: Request, res: Response, next: NextFunction){
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(403).json({
            message: "Invalid token",
        });
    }

    const token = authHeader.split(' ')[1]||"";
    try {
        const decoded = Jwt.verify(token, "nitingupta7878");
 
        if (typeof decoded === "object" && decoded !== null && "userId" in decoded) {
            req.userId = (decoded as JwtPayload).userId as string;  
            next();
        } else {
            return res.status(403).json({ message: "Invalid token payload" });
        }
    } catch (err) {
        return res.status(403).json({ message: "Error occurred during token verification" });
    }
};

 
