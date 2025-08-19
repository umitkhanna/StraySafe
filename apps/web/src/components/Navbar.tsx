import { FC, useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const Navbar: FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }; 
  }, []);

  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
      {/* Left Search */}
      <input
        type="text"
        placeholder="Search..."
        className="border rounded px-3 py-2 w-1/3"
      />

      {/* Right User Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 focus:outline-none"
        >
          <span className="text-gray-700 font-medium">Admin User</span>
          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
            className="rounded-full w-8 h-8 border"
          />
          {dropdownOpen ? (
            <ChevronUp size={18} className="text-gray-600" />
          ) : (
            <ChevronDown size={18} className="text-gray-600" />
          )}
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-50">
            <a
              href="#profile"
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              Profile
            </a>
            <a
              href="#logout"
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              Logout
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
