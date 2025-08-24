import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { queryClient } from "@/lib/queryClient";

export function useWebSocket() {
  useEffect(() => {
    // Use centralized socket instance to prevent conflicts
    const socket = getSocket();

    // Set up event listeners
    const handleLenderUpdate = () => {
      console.log("🔄 Lender products updated");
      queryClient.invalidateQueries({ queryKey: ["lender-products"] });
    };

    const handlePipelineUpdate = () => {
      console.log("🔄 Pipeline updated");
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
    };

    socket.on("lender-products:update", handleLenderUpdate);
    socket.on("pipeline:update", handlePipelineUpdate);

    return () => {
      // Remove listeners but don't disconnect (other components may be using it)
      socket.off("lender-products:update", handleLenderUpdate);
      socket.off("pipeline:update", handlePipelineUpdate);
    };
  }, []);
}