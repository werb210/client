import React from "react";
import { NavLink } from "react-router-dom";
import { useClientSession } from "@/state/useClientSession";

export default function PortalSidebar() {
  const { clear } = useClientSession();

  const navItems = [
    { label: "Dashboard", to: "/portal" },
    { label: "Documents", to: "/portal/documents" },
    { label: "Status", to: "/portal/status" },
    { label: "Messages", to: "/portal/messages" },
    { label: "Profile", to: "/portal/profile" }
  ];

  return (
    <div className="w-64 bg-white border-r h-full p-4 flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Client Portal</h2>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `p-2 rounded text-sm ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        className="mt-auto text-red-600 text-sm"
        onClick={() => {
          clear();
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </div>
  );
}
