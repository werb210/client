import type { FC } from "react";

type PortalNavProps = {
  applicationId: string;
};

export const PortalNav: FC<PortalNavProps> = ({ applicationId }) => {
  return (
    <nav className="flex justify-between mb-6 p-2 border-b">
      <button
        className="text-blue-600 font-medium"
        onClick={() => (window.location.href = `/portal?applicationId=${applicationId}`)}
      >
        Dashboard
      </button>

      <button
        className="text-blue-600 font-medium"
        onClick={() => (window.location.href = `/portal/messages?applicationId=${applicationId}`)}
      >
        Messages
      </button>

      <button
        className="text-blue-600 font-medium"
        onClick={() => (window.location.href = `/portal/assistant?applicationId=${applicationId}`)}
      >
        AI Assistant
      </button>
    </nav>
  );
};
