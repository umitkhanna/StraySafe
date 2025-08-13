// src/pages/admin/Users.tsx
import { useMemo, useState } from "react"
import AdminLayout from "@/layouts/AdminLayout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Role = "Admin" | "Manager" | "Operator"
type Status = "active" | "disabled"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: Status
  parentId?: string | null
}

const initialUsers: User[] = [
  { id: "u1", name: "Asha Singh", email: "asha@example.com", role: "Admin", status: "active", parentId: null },
  { id: "u2", name: "Mahesh Rao", email: "mahesh@example.com", role: "Manager", status: "active", parentId: "u1" },
  { id: "u3", name: "Priya Das", email: "priya@example.com", role: "Operator", status: "disabled", parentId: "u2" },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<Role | "">("")
  const [sortKey, setSortKey] = useState<"name" | "email">("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)

  const filtered = useMemo(() => {
    let data = [...users]
    if (query.trim()) {
      const q = query.toLowerCase()
      data = data.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }
    if (roleFilter) data = data.filter(u => u.role === roleFilter)

    data.sort((a, b) => {
      const av = a[sortKey].toLowerCase()
      const bv = b[sortKey].toLowerCase()
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return data
  }, [users, query, roleFilter, sortKey, sortDir])

  // ---- helpers (place BEFORE return) ----
  function toggleSort(key: "name" | "email") {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(user: User) {
    setEditing(user)
    setModalOpen(true)
  }

  function toggleStatus(id: string) {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, status: u.status === "active" ? "disabled" : "active" } : u)))
  }

  function removeUser(id: string) {
    setUsers(prev => prev.filter(u => u.id !== id))
  }
  // --------------------------------------

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Users</h2>
            <p className="text-sm text-gray-600">Manage admins, managers, and operators.</p>
          </div>
          <Button onClick={openCreate}>Add User</Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64">
            <Label htmlFor="search">Search</Label>
            <Input id="search" placeholder="Search name or email…" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div className="w-48">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as Role | "")}
            >
              <option value="">All</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Operator">Operator</option>
            </select>
          </div>
          <div className="flex gap-2">
            <SortButton label="Name" active={sortKey === "name"} dir={sortKey === "name" ? sortDir : undefined} onClick={() => toggleSort("name")} />
            <SortButton label="Email" active={sortKey === "email"} dir={sortKey === "email" ? sortDir : undefined} onClick={() => toggleSort("email")} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Parent</Th>
                <Th className="pr-4 text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-t">
                  <Td className="font-medium">{u.name}</Td>
                  <Td>{u.email}</Td>
                  <Td>{u.role}</Td>
                  <Td>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs", u.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700")}>
                      {u.status}
                    </span>
                  </Td>
                  <Td>{u.parentId ? users.find(x => x.id === u.parentId)?.name ?? "—" : "—"}</Td>
                  <Td className="space-x-2 pr-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => openEdit(u)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleStatus(u.id)}>
                      {u.status === "active" ? "Disable" : "Enable"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeUser(u.id)}>Delete</Button>
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <Td colSpan={6} className="py-10 text-center text-gray-500">No users found.</Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <UserModal
          users={users}
          initial={editing ?? undefined}
          onClose={() => setModalOpen(false)}
          onSave={(payload) => {
            if (editing) {
              setUsers(prev => prev.map(u => (u.id === editing.id ? { ...u, ...payload } : u)))
            } else {
              const id = `u${Math.random().toString(36).slice(2, 8)}`
              setUsers(prev => [{ id, status: "active", ...payload }, ...prev])
            }
            setModalOpen(false)
          }}
        />
      )}
    </AdminLayout>
  )
}

// --- small helpers/components need to be moved to componets folder ---
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600", className)}>{children}</th>
}
function Td({ children, className = "", colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={cn("px-4 py-3 align-middle", className)}>{children}</td>
}
function SortButton({
  label, active, dir, onClick
}: { label: string; active?: boolean; dir?: "asc" | "desc"; onClick: () => void }) {
  return (
    <Button variant={active ? "default" : "outline"} size="sm" onClick={onClick}>
      {label}{active ? (dir === "asc" ? " ↑" : " ↓") : ""}
    </Button>
  )
}

function UserModal({
  users, initial, onClose, onSave
}: {
  users: User[]
  initial?: Partial<User>
  onClose: () => void
  onSave: (u: Omit<User, "id" | "status"> & { status?: Status }) => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [email, setEmail] = useState(initial?.email ?? "")
  const [role, setRole] = useState<Role>((initial?.role as Role) ?? "Operator")
  const [parentId, setParentId] = useState<string | "">(initial?.parentId ?? "")
  const [error, setError] = useState<string>("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError("Name is required.")
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setError("Valid email is required.")
    setError("")
    onSave({ name: name.trim(), email: email.trim().toLowerCase(), role, parentId: parentId || null })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{initial?.id ? "Edit User" : "Add User"}</h3>
          <Button variant="ghost" onClick={onClose} aria-label="Close">✕</Button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={role}
                onChange={(e) => (setRole(e.target.value as Role))}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Operator">Operator</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parent">Parent (Supervisor)</Label>
              <select
                id="parent"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">— None —</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{initial?.id ? "Save changes" : "Create user"}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
