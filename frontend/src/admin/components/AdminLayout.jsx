import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const activePage =
    location.pathname === "/admin"
      ? "dashboard"
      : location.pathname.split("/")[2] || "dashboard";

  const handleNavigation = (section) => {
    if (section === "dashboard") {
      navigate("/admin");
    } else {
      navigate(`/admin/${section}`);
    }

    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <AdminSidebar
        activeItem={activePage}
        onNavigate={handleNavigation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <AdminHeader
          activePage={activePage}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
