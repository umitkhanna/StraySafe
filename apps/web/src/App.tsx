import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "@/pages/Login"
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/users" element={<UsersPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
