import { io } from "socket.io-client";

const IS_DEV = import.meta.env.MODE === "development";

export const WS_URL = IS_DEV
  ? "ws://localhost:5000/ws"
  : import.meta.env.VITE_WS_URL || "wss://staff.boreal.financial/ws";

export const socket = io(WS_URL, {
  transports: ["websocket"],
  reconnection: true,
});

socket.on("connect", () => console.info("[Client WS] Connected"));
socket.on("disconnect", () => console.warn("[Client WS] Disconnected"));
socket.on("connect_error", (err) =>
  console.error("[Client WS] Connection Error:", err.message)
);