
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("admin-theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("admin-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const navigate = useNavigate();
  const location = useLocation();
  const isSubdomain = window.location.hostname.startsWith("admin.");
  const basePath = isSubdomain ? "" : "/admin";

 
  const activePage = location.pathname.split("/")[1] || "dashboard";



  const handleNavigation = (section) => {
    if (section === "dashboard") {
      navigate("/");
    } else {
      navigate(`/${section}`);
    }

    setSidebarOpen(false);
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

      <div className="min-w-0 flex-1">
        <AdminHeader
          activePage={activePage}
          onMenuClick={() => setSidebarOpen(true)}
          isDark={isDark}
          onToggleTheme={() => setIsDark((previous) => !previous)}
        />

        <main className="admin-page mx-auto min-h-[calc(100vh-64px)] max-w-7xl px-4 py-6 transition-colors duration-300 sm:px-6 lg:px-8 lg:py-8">
          <Outlet context={{ isDark }} />
        </main>
      </div>
    </div>
  );
}