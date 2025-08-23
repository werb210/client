import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { queryClient } from "@/lib/queryClient";

export const useLiveStatus = () => {
  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on("pipeline:update", () => {
      console.info("[Client] Refreshing lender products");
      queryClient.invalidateQueries({ queryKey: ["lender-products"] });
    });

    return () => {
      socket.off("pipeline:update");
    };
  }, []);
};