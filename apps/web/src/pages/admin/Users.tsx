import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Example flat user list
const allUsers = Array.from({ length: 42 }).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  role: i % 2 === 0 ? "Operator" : "Ground Staff",
  email: `user${i + 1}@example.com`,
}));

export default function ManageUsersPage() {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(filter.toLowerCase()) ||
      u.role.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageUsers = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
        Manage Users
      </h1>

      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Search by name or role..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="p-3 text-sm font-semibold">ID</th>
              <th className="p-3 text-sm font-semibold">Name</th>
              <th className="p-3 text-sm font-semibold">Role</th>
              <th className="p-3 text-sm font-semibold">Email</th>
            </tr>
          </thead>
          <tbody>
            {pageUsers.map((u) => (
              <tr key={u.id} className="border-b border-slate-200 dark:border-slate-700">
                <td className="p-3 text-sm">{u.id}</td>
                <td className="p-3 text-sm">{u.name}</td>
                <td className="p-3 text-sm">{u.role}</td>
                <td className="p-3 text-sm">{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Pagination */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="rounded bg-slate-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-slate-700 dark:text-white"
        >
          Previous
        </button>
        <span className="text-sm text-slate-700 dark:text-slate-300">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="rounded bg-slate-200 px-3 py-1 text-sm disabled:opacity-50 dark:bg-slate-700 dark:text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
}
