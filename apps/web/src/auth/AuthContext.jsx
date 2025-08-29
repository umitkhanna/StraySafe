import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(() => {
    return localStorage.getItem("isImpersonating") === "true";
  });
  const [impersonatedBy, setImpersonatedBy] = useState(() => {
    return localStorage.getItem("impersonatedBy");
  });

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      
      // Clear any impersonation state on fresh login
      localStorage.removeItem("isImpersonating");
      localStorage.removeItem("impersonatedBy");
      setIsImpersonating(false);
      setImpersonatedBy(null);
      
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e?.response?.data?.error || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const impersonate = async (userId) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/impersonate", { userId });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isImpersonating", "true");
      localStorage.setItem("impersonatedBy", data.impersonatedBy);
      
      setToken(data.token);
      setUser(data.user);
      setIsImpersonating(true);
      setImpersonatedBy(data.impersonatedBy);
      
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e?.response?.data?.error || "Impersonation failed" };
    } finally {
      setLoading(false);
    }
  };

  const stopImpersonating = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/stop-impersonating");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("isImpersonating");
      localStorage.removeItem("impersonatedBy");
      
      setToken(data.token);
      setUser(data.user);
      setIsImpersonating(false);
      setImpersonatedBy(null);
      
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e?.response?.data?.error || "Failed to stop impersonating" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isImpersonating");
    localStorage.removeItem("impersonatedBy");
    setToken(null);
    setUser(null);
    setIsImpersonating(false);
    setImpersonatedBy(null);
  };

  // (Optional) try to refresh "me" on mount if token exists
  useEffect(() => {
    const bootstrap = async () => {
      if (!token || user) return;
      try {
        const { data } = await api.get("/auth/me");
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      } catch {
        logout();
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthCtx.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      loading, 
      impersonate, 
      stopImpersonating, 
      isImpersonating, 
      impersonatedBy 
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
