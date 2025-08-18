import { Link, NavLink } from "react-router-dom"
import type { ReactNode } from "react";


export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      <aside className="fixed inset-y-0 left-0 w-64 border-r bg-white">
        <div className="p-4 border-b">
          <Link to="/admin" className="text-xl font-semibold">Admin</Link>
          <p className="text-xs text-gray-500">StraySafe</p>
        </div>
        <nav className="p-3 space-y-1">
          <NavItem to="/admin/users" label="Users" />
          <NavItem to="/admin/settings" label="Settings (coming soon)" />
        </nav>
      </aside>

      <div className="pl-64">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
          <div className="flex items-center justify-between px-6 h-14">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <div className="text-sm text-gray-600">Logged in as Admin</div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-md px-3 py-2 text-sm ${isActive ? "bg-black text-white" : "hover:bg-black/5"}`
      }
    >
      {label}
    </NavLink>
  )
}
