// ✅ Auto-refresh products when webhook or WS message received

const STAFF_API_URL = '/api';
const STAFF_WS_URL = 'wss://staff.boreal.financial';

// Simple in-memory cache
const cache = new Map();

export async function fetchLenderProducts() {
  const response = await fetch(`${STAFF_API_URL}/lender-products/sync`);
  if (!response.ok) throw new Error("Failed to fetch lender products");
  const data = await response.json();
  return data.products || [];
}

// WebSocket listener
const ws = new WebSocket(`${STAFF_WS_URL}`);
ws.onmessage = (event) => {
  const { type, products } = JSON.parse(event.data);
  if (type === "PRODUCT_SYNC") {
    cache.set("lender_products", products);
    renderProducts(products);
  }
};

ws.onopen = () => {
  console.log('✅ WebSocket connected to staff backend');
};

ws.onerror = (error) => {
  console.error('❌ WebSocket connection error:', error);
};

ws.onclose = () => {
  console.log('🔌 WebSocket connection closed');
};

// Render products function
function renderProducts(products: any[]) {
  // Trigger UI update - this would integrate with your React components
  const event = new CustomEvent('lenderProductsUpdated', { detail: products });
  window.dispatchEvent(event);
}

// Get cached products
export function getCachedProducts() {
  return cache.get("lender_products") || [];
}

// Set products in cache
export function setCachedProducts(products: any[]) {
  cache.set("lender_products", products);
  renderProducts(products);
}

// Webhook endpoint for server push
export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    const products = req.body;
    cache.set("lender_products", products);
    return res.status(200).json({ received: products.length });
  }
}