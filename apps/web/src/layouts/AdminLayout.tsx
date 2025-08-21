import { useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/admin/users":
        return "User Management";
      case "/admin/ngos":
        return "NGO Management";
      case "/admin/municipalities":
        return "Municipality Management";
      case "/admin/settings":
        return "Settings";
      default:
        return "Admin Panel";
    }
  };

  return (
     <div className="flex">
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

      <div
        className={`flex-1 min-h-screen bg-gray-100 transition-all duration-300 ${
          isOpen ? "ml-60" : "ml-16"
        }`}
      >
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{getPageTitle()}</h2>
          {children}
        </div>
      </div>
    </div>
  )
}
