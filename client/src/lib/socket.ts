import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  path: "/ws",
  transports: ["websocket"],
  autoConnect: false,
  auth: {
    token: `Bearer ${import.meta.env.VITE_CLIENT_TOKEN}`,
  },
});

socket.on("connect", () => console.info("[Client WS] Connected"));
socket.on("disconnect", () => console.warn("[Client WS] Disconnected"));
socket.on("connect_error", (err: Error) => console.error("[Client WS] Error:", err.message));