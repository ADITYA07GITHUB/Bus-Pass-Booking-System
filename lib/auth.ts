// lib/auth.ts - JWT authentication utilities

import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { User } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";
const JWT_EXPIRY = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "user" | "admin";
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for authenticated user
 */
export function generateToken(user: Partial<User>): string {
  const payload: JWTPayload = {
    userId: user._id!,
    email: user.email!,
    role: user.role!,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extract and verify JWT from request headers
 */
export function getAuthFromRequest(req: NextRequest): JWTPayload | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

/**
 * Check if the authenticated user is an admin
 */
export function isAdmin(auth: JWTPayload | null): boolean {
  return auth?.role === "admin";
}
