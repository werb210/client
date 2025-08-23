import { useEffect } from "react";
import { io } from "socket.io-client";
import { queryClient } from "@/lib/queryClient";

const WS_URL = import.meta.env.VITE_WS_URL;
const CLIENT_TOKEN = import.meta.env.VITE_CLIENT_TOKEN;

export function useWebSocket() {
  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ["websocket"],
      auth: { token: CLIENT_TOKEN }
    });

    socket.on("connect", () => console.log("✅ WebSocket connected"));

    socket.on("lender-products:update", () => {
      console.log("🔄 Lender products updated");
      queryClient.invalidateQueries({ queryKey: ["lender-products"] });
    });

    socket.on("pipeline:update", () => {
      console.log("🔄 Pipeline updated");
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
    });

    socket.on("disconnect", () => console.warn("⚠️ WebSocket disconnected"));

    return () => {
      socket.disconnect();
    };
  }, []);
}