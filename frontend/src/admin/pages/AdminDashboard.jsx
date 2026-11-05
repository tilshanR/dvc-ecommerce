
import { useState } from "react";
import {
  Package,
  Tags,
  CheckCircle,
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
  PackagePlus,
  Pencil,
  Archive,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import StatCard from "../components/StatCard";
import PageHeader from "../components/PageHeader";

const stats = [
  {
    title: "Total Products",
    value: "128",
    icon: Package,
    description: "Products in your catalogue",
  },
  {
    title: "Categories",
    value: "12",
    icon: Tags,
    description: "Main and subcategories",
  },
  {
    title: "Active Products",
    value: "110",
    icon: CheckCircle,
    description: "Currently available in shop",
  },
  {
    title: "Low Stock",
    value: "8",
    icon: AlertTriangle,
    description: "Products needing attention",
  },
];

const recentActivities = [
  {
    id: 1,
    title: "New product added",
    detail: "Samsung Galaxy A Series",
    time: "Today",
    icon: PackagePlus,
    color: "text-green-700 bg-green-50",
  },
  {
    id: 2,
    title: "Product updated",
    detail: "Logitech Wireless Mouse",
    time: "Yesterday",
    icon: Pencil,
    color: "text-blue-700 bg-blue-50",
  },
  {
    id: 3,
    title: "Category archived",
    detail: "Old Computer Accessories",
    time: "2 days ago",
    icon: Archive,
    color: "text-orange-700 bg-orange-50",
  },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("dashboard");

  const handleNavigation = (section) => {
    setSelectedSection(section);
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Sidebar */}
      <AdminSidebar
        activeItem={selectedSection}
        onNavigate={handleNavigation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <AdminHeader
          activePage="dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Page heading */}
          <PageHeader
            title="Dashboard Overview"
            description="Welcome to your DVC Store administration panel."
          />

          {/* Temporary navigation notice */}
          {selectedSection !== "dashboard" && (
            <div
              role="status"
              className="mb-6 rounded-lg border border-[#C8DAD6] bg-[#E8F0EF] p-4 text-sm text-[#183D3D]"
            >
              <p className="font-semibold">
                {selectedSection === "products" ? "Products" : "Categories"}{" "}
                management is coming in the next development stage.
              </p>
              <p className="mt-1">
                Navigation will be connected when those pages are implemented.
              </p>
            </div>
          )}

          {/* Statistics */}
          <section aria-label="Store statistics">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Store Summary
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                An overview of your products and categories.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </div>
          </section>

          {/* Dashboard lower section */}
          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Recent activity */}
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Latest changes in your store.
                  </p>
                </div>

                <Clock size={20} className="text-gray-400" />
              </div>

              <div className="mt-5 divide-y divide-gray-100">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;

                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${activity.color}`}
                      >
                        <Icon size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {activity.title}
                        </p>
                        <p className="mt-1 truncate text-sm text-gray-500">
                          {activity.detail}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-gray-400">
                        {activity.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Quick actions */}
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Shortcuts for common tasks.
              </p>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => handleNavigation("products")}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 text-left transition hover:border-[#183D3D] hover:bg-[#F5F8F7]"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F0EF] text-[#183D3D]">
                      <Plus size={19} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-gray-800">
                        Add Product
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        Create a new product
                      </span>
                    </span>
                  </span>

                  <ArrowRight size={17} className="text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigation("categories")}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 text-left transition hover:border-[#183D3D] hover:bg-[#F5F8F7]"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F0EF] text-[#183D3D]">
                      <Tags size={19} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-gray-800">
                        Add Category
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        Organize your products
                      </span>
                    </span>
                  </span>

                  <ArrowRight size={17} className="text-gray-400" />
                </button>
              </div>
            </section>
          </div>

          {/* Footer note */}
          <p className="mt-8 text-center text-xs text-gray-400">
            DVC Store Admin Panel · Dashboard preview
          </p>
        </main>
      </div>
    </div>
  );
}
