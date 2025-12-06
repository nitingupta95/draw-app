import { NextFunction, Request, Response } from "express";
import Jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
 
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function middleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    res.status(403).json({ message: "Invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(403).json({ message: "Token missing" });
    return;
  }

  try {
    const decoded = Jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded.userId) {
      res.status(403).json({ message: "Invalid token payload" });
      return;
    }

    req.userId = decoded.userId;
    next(); // middleware MUST call next()
  } catch (err) {
    res.status(403).json({ message: "Error during token verification" });
  }
}
