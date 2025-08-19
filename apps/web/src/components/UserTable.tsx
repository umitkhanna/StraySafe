import { useState, FC, ChangeEvent, useRef, useEffect } from "react";
import { MoreVertical, Edit, Trash, Plus } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const dummyUsers: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
  { id: 3, name: "Michael Brown", email: "mike@example.com", role: "User" },
  { id: 4, name: "Emily Davis", email: "emily@example.com", role: "Admin" },
];

const UserTable: FC = () => {
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
  };

  const filteredUsers = dummyUsers.filter(
    (u) =>
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())) &&
      (roleFilter === "All" || u.role === roleFilter)
  );

  // close action menus when clicking outside
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white p-4 shadow rounded mt-6">
      {/* Top Bar with Add Button & Filters */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Users</h3>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          <Plus size={18} /> Add New User
        </button>
      </div>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="border px-3 py-2 rounded w-1/3"
          value={search}
          onChange={handleSearch}
        />
        <select
          className="border px-3 py-2 rounded"
          value={roleFilter}
          onChange={handleRoleChange}
        >
          <option value="All">All</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>
      </div>

      {/* Table */}
      <table className="w-full border">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border text-center">Actions</th>
          </tr>
        </thead>
        <tbody ref={menuRef}>
          {filteredUsers.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="p-2 border">{u.id}</td>
              <td className="p-2 border">{u.name}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border text-center relative">
                {/* Action Button */}
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === u.id ? null : u.id)
                  }
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <MoreVertical size={18} />
                </button>

                {/* Dropdown Menu */}
                {openMenuId === u.id && (
                  <div className="absolute right-2 mt-2 w-32 bg-white border rounded shadow-md z-50">
                    <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100">
                      <Edit size={16} /> Edit
                    </button>
                    <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                      <Trash size={16} /> Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination placeholder */}
      <div className="flex justify-end mt-4 gap-2">
        <button className="px-3 py-1 border rounded">Prev</button>
        <button className="px-3 py-1 border rounded">Next</button>
      </div>
    </div>
  );
};

export default UserTable;
