import { FC } from "react";
import { Menu, Users, Settings } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={`bg-gray-900 text-white fixed top-0 left-0 h-full transition-all duration-300 ${
        isOpen ? "w-60" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <button onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        {isOpen && <h1 className="text-lg font-bold">Admin</h1>}
      </div>

      <nav className="mt-4 space-y-2">
        <a className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700">
          <Users size={20} /> {isOpen && "Users"}
        </a>
        <a className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700">
          <Settings size={20} /> {isOpen && "Settings"}
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
