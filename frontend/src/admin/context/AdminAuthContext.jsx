import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../../services/api";
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/me");
      setAdmin(data.admin || null);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Listen for 401 session expiration events from Axios
  useEffect(() => {
    const handleUnauthorized = () => {
      setAdmin(null);
    };

    window.addEventListener("dvc:admin-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("dvc:admin-unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post("/admin/login", credentials);
    setAdmin(data.admin);
    return data;
  };

  const signup = async (payload) => {
    const { data } = await api.post("/admin/signup", payload);
    setAdmin(data.admin);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/admin/logout");
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated: Boolean(admin),
        loading,
        login,
        signup,
        logout,
        refreshSession: checkSession,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider.");
  }
  return context;
}
