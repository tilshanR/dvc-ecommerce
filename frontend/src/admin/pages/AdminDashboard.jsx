
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

import { useNavigate } from "react-router-dom";

import StatCard from "../components/ui/StatCard";
import PageHeader from "../components/ui/PageHeader";
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
  const navigate = useNavigate();

  return (
    <>
      {/* Page heading */}
      <PageHeader
        title="Dashboard Overview"
        description="Welcome to your DVC Store administration panel."
      />

      {/* Statistics */}
      <section className="mb-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Store Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            A quick summary of your store performance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
            />
          ))}
        </div>
      </section>

      {/* Recent activity and quick actions */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent activity */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Latest changes made to your store.
              </p>
            </div>

            <Clock className="h-5 w-5 text-gray-400" />
          </div>

          <div className="divide-y divide-gray-100">
            {recentActivities.map((activity) => {
              const ActivityIcon = activity.icon;

              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${activity.color}`}
                  >
                    <ActivityIcon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
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
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Common store management tasks.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Add Product
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Create a new product
                  </p>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                  <Tags className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Manage Categories
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Organize your catalogue
                  </p>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </section>
      </div>

      {/* Footer note */}
      <div className="mt-8 border-t border-gray-200 pt-5">
        <p className="text-center text-xs text-gray-400">
          DVC Store Admin Panel · Dashboard preview data
        </p>
      </div>
    </>
  );
}
