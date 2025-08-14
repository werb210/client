import jwt from "jsonwebtoken";

const secret = process.env.LENDER_JWT_SECRET || "dev_lender_secret";

export function verifyShareToken(token: string) {
  try { 
    return jwt.verify(token, secret) as any; 
  } catch (error) {
    console.error("JWT verification error:", error);
    return null; 
  }
}

export function createShareToken(data: any, expiresIn: string = "30d") {
  return jwt.sign(data, secret, { expiresIn });
}