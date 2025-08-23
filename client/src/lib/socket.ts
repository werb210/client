import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_WS_URL, {
  transports: ['websocket'],
  reconnection: true,
  withCredentials: true,
});

socket.on("connect", () => console.info("[Client WS] Connected"));
socket.on("disconnect", () => console.warn("[Client WS] Disconnected"));
socket.on("connect_error", (err) =>
  console.error("[Client WS] Connection Error:", err.message)
);