import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NotifBellClientProps {
  contactId: string;
}

export default function NotifBellClient({ contactId }: NotifBellClientProps) {
  const [count, setCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!contactId) return;

    let eventSource: EventSource | null = null;

    const connectToStream = () => {
      try {
        eventSource = new EventSource(`/api/client/notifications/stream?contactId=${encodeURIComponent(contactId)}`);
        
        eventSource.addEventListener("open", () => {
          setIsConnected(true);
          console.log("Notification stream connected");
        });

        eventSource.addEventListener("notification", (event) => {
          setCount(c => c + 1);
          console.log("New notification received:", event.data);
        });

        eventSource.addEventListener("ping", () => {
          // Keep connection alive
        });

        eventSource.addEventListener("error", (error) => {
          console.error("Notification stream error:", error);
          setIsConnected(false);
          
          // Retry connection after 5 seconds
          setTimeout(() => {
            if (eventSource?.readyState === EventSource.CLOSED) {
              connectToStream();
            }
          }, 5000);
        });

      } catch (error) {
        console.error("Failed to establish notification stream:", error);
        setIsConnected(false);
      }
    };

    connectToStream();

    return () => {
      if (eventSource) {
        eventSource.close();
        setIsConnected(false);
      }
    };
  }, [contactId]);

  const handleClick = () => {
    window.location.href = `/client/notifications?contactId=${encodeURIComponent(contactId)}`;
  };

  return (
    <button
      onClick={handleClick}
      className="relative inline-flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
      title="View notifications"
    >
      <Bell 
        className={`w-6 h-6 ${isConnected ? 'text-gray-700' : 'text-gray-400'}`}
      />
      {count > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
      {!isConnected && (
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" 
             title="Reconnecting..." />
      )}
    </button>
  );
}