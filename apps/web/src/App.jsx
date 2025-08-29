import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/admin/Users.jsx";
import NGOsPage from "./pages/admin/NGOs.jsx";
import MunicipalitiesPage from "./pages/admin/Municipalities.jsx";
import Tickets from "./pages/Tickets";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin', 'ngoAdmin', 'municipalityAdmin']}>
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/ngos" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <NGOsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/municipalities" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MunicipalitiesPage />
              </ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute allowedRoles={['operators', 'groundStaff']}>
                <Tickets />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['admin', 'ngoAdmin', 'municipalityAdmin']}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
