import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("admin-theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("admin-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAdminAuth();

  const activePage = location.pathname.split("/")[1] || "dashboard";

  const handleNavigation = (section) => {
    if (section === "dashboard") {
      navigate("/");
    } else {
      navigate(`/${section}`);
    }

    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div
      data-admin-theme={isDark ? "dark" : "light"}
      className="min-h-screen transition-colors duration-300 lg:flex"
    >
      <AdminSidebar
        activeItem={activePage}
        onNavigate={handleNavigation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isDark={isDark}
      />

      <div className="admin-page flex min-h-screen min-w-0 flex-1 flex-col transition-colors duration-300">
        <AdminHeader
          activePage={activePage}
          onMenuClick={() => setSidebarOpen(true)}
          isDark={isDark}
          onToggleTheme={() => setIsDark((previous) => !previous)}
          admin={admin}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />

        <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet context={{ isDark }} />
        </main>
      </div>
    </div>
  );
}
