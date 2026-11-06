
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({
  activePage = "dashboard",
  onNavigate = () => {},
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigation = (section) => {
    onNavigate(section);
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
          {children}
        </main>
      </div>
    </div>
  );
}
