import { FC } from "react";
import { Menu, Users, Settings, Building2, MapPin, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    {
      to: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      to: "/admin/users",
      icon: Users,
      label: "Users",
    },
    {
      to: "/admin/ngos",
      icon: Building2,
      label: "NGOs",
    },
    {
      to: "/admin/municipalities",
      icon: MapPin,
      label: "Municipalities",
    },
  ];

  return (
    <div
      className={`bg-gray-900 text-white fixed top-0 left-0 h-full transition-all duration-300 z-50 ${
        isOpen ? "w-60" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <button onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        {isOpen && <h1 className="text-lg font-bold">StraySafe Admin</h1>}
      </div>

      <nav className="mt-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors ${
                isActive ? "bg-gray-700 border-r-2 border-blue-500" : ""
              }`}
            >
              <Icon size={20} />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
        
        {/* Settings separator */}
        {isOpen && <div className="border-t border-gray-700 my-4" />}
        
        <Link
          to="/admin/settings"
          className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors ${
            location.pathname === "/admin/settings" ? "bg-gray-700 border-r-2 border-blue-500" : ""
          }`}
        >
          <Settings size={20} />
          {isOpen && <span className="font-medium">Settings</span>}
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
