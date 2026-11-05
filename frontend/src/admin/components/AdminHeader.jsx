
import { Bell, Menu, UserCircle } from "lucide-react";

const pageDetails = {
  dashboard: {
    title: "Dashboard",
    description: "Overview of your store performance and activity.",
  },
  products: {
    title: "Products",
    description: "Manage your store products and inventory.",
  },
  categories: {
    title: "Categories",
    description: "Organize and manage your product categories.",
  },
};

export default function AdminHeader({
  activePage = "dashboard",
  onMenuClick = () => {},
}) {
  const currentPage =
    pageDetails[activePage] || pageDetails.dashboard;

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-[#183D3D] lg:hidden"
          >
            <Menu size={22} />
          </button>

          {/* Page information */}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
              {currentPage.title}
            </h1>

            <p className="mt-1 hidden truncate text-sm text-gray-500 sm:block">
              {currentPage.description}
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className="relative rounded-lg p-2 text-gray-500 transition hover:bg-[#E8F0EF] hover:text-[#183D3D]"
          >
            <Bell size={21} />

            {/* Decorative notification indicator */}
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </button>

          {/* Divider */}
          <div className="hidden h-9 w-px bg-gray-200 sm:block" />

          {/* Admin profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F0EF] text-[#183D3D]">
              <UserCircle size={23} />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">
                Administrator
              </p>
              <p className="text-xs text-gray-500">
                Store Manager
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
