import fs from "fs";
import path from "path";

const PRODUCTS_PATH = path.join(process.cwd(), "data", "lenderProducts.json");
const STAFF_API_URL = process.env.STAFF_API_URL || "https://staff.boreal.financial/api/lender-products";

export async function seedLenderProducts() {
  try {
    console.log("🌱 Attempting to seed lender products from staff API...");
    
    const res = await fetch(STAFF_API_URL, {
      headers: {
        Authorization: `Bearer ${process.env.CLIENT_SYNC_KEY}`,
      },
    });

    if (!res.ok) {
      console.error("❌ Failed to fetch lender products from staff app:", res.status, res.statusText);
      return false;
    }

    const data = await res.json();
    const products = data.products || data;
    
    // Ensure data directory exists
    const dataDir = path.dirname(PRODUCTS_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));
    console.log(`✅ Lender products seeded successfully: ${products.length} products`);
    return true;
  } catch (err) {
    console.error("❌ Error seeding lender products:", err.message);
    return false;
  }
}

export function checkLocalProducts(): boolean {
  try {
    if (!fs.existsSync(PRODUCTS_PATH)) {
      console.log("📁 Local products file does not exist");
      return false;
    }

    const content = fs.readFileSync(PRODUCTS_PATH, 'utf8');
    const products = JSON.parse(content);
    
    if (!Array.isArray(products) || products.length === 0) {
      console.log("📁 Local products file is empty");
      return false;
    }

    console.log(`📁 Found ${products.length} products in local cache`);
    return true;
  } catch (err) {
    console.error("❌ Error checking local products:", err.message);
    return false;
  }
}

export async function initLenderProducts() {
  const hasLocalProducts = checkLocalProducts();
  
  if (!hasLocalProducts) {
    console.log("🌱 No local products found, seeding from staff API...");
    await seedLenderProducts();
  } else {
    console.log("✅ Local lender products cache is ready");
  }
}