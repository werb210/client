// src/api/lenderProducts.ts
import { useEffect, useState } from 'react';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  const data = await response.json();
  return data.products || data;
};

export const useLenderProducts = () => {
  const [products, setProducts] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  // Initial fetch
  const fetchProducts = async () => {
    const data = await fetcher('/api/lender-products/sync');
    setProducts(data);
  };

  // WebSocket for real-time updates
  useEffect(() => {
    fetchProducts(); // Initial load
    const token = localStorage.getItem('authToken');
    const ws = new WebSocket(
      `wss://staff.boreal.financial?token=${token}`
    );

    ws.onopen = () => setSocketConnected(true);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'PRODUCT_SYNC') {
        setProducts(msg.products); // ✅ Full dataset replacement
      }
    };
    ws.onerror = () => console.error('WebSocket failed, switching to polling');
    ws.onclose = () => setSocketConnected(false);

    return () => ws.close();
  }, []);

  return { products, socketConnected, refresh: fetchProducts };
};