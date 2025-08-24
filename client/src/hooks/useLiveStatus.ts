import { useEffect } from "react";
// DISABLED: Socket imports causing console errors
// import { socket } from "@/lib/socket";
import { queryClient } from "@/lib/queryClient";

export const useLiveStatus = () => {
  useEffect(() => {
    console.log('🔄 Live status monitoring disabled - using HTTP polling');
    
    // DISABLED: Socket.IO causing console errors
    // if (!socket.connected) socket.connect();
    // socket.on("pipeline:update", () => {
    //   console.info("[Client] Refreshing lender products");
    //   queryClient.invalidateQueries({ queryKey: ["lender-products"] });
    // });

    return () => {
      // socket.off("pipeline:update");
    };
  }, []);
};