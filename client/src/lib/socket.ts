import { io } from "socket.io-client";

const WS_URL =
  import.meta.env.MODE === "development"
    ? "ws://localhost:5000/ws"
    : "wss://staff.boreal.financial/ws";

export const socket = io(WS_URL, {
  path: "/ws",
  transports: ["websocket"],
  auth: {
    token: `Bearer ${import.meta.env.VITE_CLIENT_TOKEN}`,
  },
});

socket.on("connect", () => console.info("[Client WS] Connected"));
socket.on("disconnect", () => console.warn("[Client WS] Disconnected"));
socket.on("connect_error", (err) =>
  console.error("[Client WS] Connection Error:", err.message)
);