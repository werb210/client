import { LenderProduct } from '@/api/lenderProducts';

// IndexedDB-based local storage for lender products
const DB_NAME = 'BoreaLenderDB';
const DB_VERSION = 1;
const STORE_NAME = 'lenderProducts';

let db: IDBDatabase | null = null;

// Initialize IndexedDB
async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      // Create object store with id as key
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('lenderName', 'lenderName', { unique: false });
        store.createIndex('productType', 'productType', { unique: false });
        store.createIndex('isActive', 'isActive', { unique: false });
      }
    };
  });
}

// Get all local products
export async function getAllLocalProducts(): Promise<LenderProduct[]> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

// Upsert (insert or update) a product
export async function upsertProduct(product: LenderProduct): Promise<void> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Add updatedAt timestamp for sync tracking
    const productWithTimestamp = {
      ...product,
      lastSyncedAt: new Date().toISOString()
    };
    
    const request = store.put(productWithTimestamp);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Bulk upsert multiple products (more efficient for sync)
export async function upsertProducts(products: LenderProduct[]): Promise<void> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    let completed = 0;
    
    const syncTimestamp = new Date().toISOString();
    
    products.forEach(product => {
      const productWithTimestamp = {
        ...product,
        lastSyncedAt: syncTimestamp
      };
      
      const request = store.put(productWithTimestamp);
      
      request.onsuccess = () => {
        completed++;
        if (completed === products.length) {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });

    // Handle empty array case
    if (products.length === 0) {
      resolve();
    }
  });
}

// Get products by criteria (for recommendation engine)
export async function getProductsByType(productType: string): Promise<LenderProduct[]> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('productType');
    const request = index.getAll(productType);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

// Get active products only
export async function getActiveProducts(): Promise<LenderProduct[]> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      // Filter active products after retrieval
      const allProducts = request.result || [];
      const activeProducts = allProducts.filter(product => product.isActive === true);
      resolve(activeProducts);
    };
  });
}

// Clear all local products (for full refresh)
export async function clearLocalProducts(): Promise<void> {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Get sync statistics
export async function getSyncStats(): Promise<{
  totalProducts: number;
  lastSyncTime: string | null;
  productsByType: Record<string, number>;
}> {
  const products = await getAllLocalProducts();
  const productsByType: Record<string, number> = {};
  let lastSyncTime: string | null = null;

  products.forEach(product => {
    // Count by product type
    productsByType[product.productType] = (productsByType[product.productType] || 0) + 1;
    
    // Track most recent sync time
    const syncTime = (product as any).lastSyncedAt;
    if (syncTime && (!lastSyncTime || syncTime > lastSyncTime)) {
      lastSyncTime = syncTime;
    }
  });

  return {
    totalProducts: products.length,
    lastSyncTime,
    productsByType
  };
}