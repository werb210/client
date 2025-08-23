import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const PRODUCTS_PATH = path.join(process.cwd(), "data", "lenderProducts.json");

export default function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = req.headers.authorization?.replace("Bearer ", "");
  if (key !== process.env.CLIENT_SYNC_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    // Ensure data directory exists
    const dataDir = path.dirname(PRODUCTS_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(req.body.products, null, 2));
    console.log("✅ Lender products updated locally");
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Failed to update lender products:", err);
    return res.status(500).json({ error: "Failed to save products" });
  }
}