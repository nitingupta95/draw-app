import { NextFunction, Request, Response } from "express";
import Jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config"
 
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export function middleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ message: "Invalid token" });
    }
  
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: "Token missing" });
    }
  
    try {
      const decoded = Jwt.verify(token, JWT_SECRET) as JwtPayload;
  
      if (!decoded.userId) {
        return res.status(403).json({ message: "Invalid token payload" });
      }
  
      req.userId = decoded.userId;
      next();
    } catch (err) {
      return res.status(403).json({ message: "Error during token verification" });
    }
  }
  