import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export const JWT_SECRET = process.env.JWT_SECRET || "nexa-jwt-secret-2024";
export const ADMIN_SECRET = process.env.ADMIN_SECRET || "nexa-admin-secret-2024";

export interface AuthPayload {
  userId: string;
  role: "user" | "merchant";
  walletId: string;
}

export interface AdminPayload {
  admin: true;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      isAdmin?: boolean;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  const token = auth.slice(7);
  try {
    jwt.verify(token, ADMIN_SECRET);
    req.isAdmin = true;
    next();
  } catch {
    res.status(401).json({ error: "Admin access required" });
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function signAdminToken(): string {
  return jwt.sign({ admin: true }, ADMIN_SECRET, { expiresIn: "8h" });
}
