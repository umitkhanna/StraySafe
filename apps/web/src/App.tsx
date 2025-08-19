import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import UsersPage from "@/pages/admin/Users"
import "./App.css";

function NotFound() {
  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">404</h1>
        <p className="text-sm text-muted-foreground">Page not found</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Admin */}
          <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
          <Route path="/admin/users" element={<UsersPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
