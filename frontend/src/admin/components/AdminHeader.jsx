import { Bell, Menu, UserCircle, Sun, Moon } from "lucide-react";

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
  isDark = false,
  onToggleTheme = () => {},
}) {
  const currentPage = pageDetails[activePage] || pageDetails.dashboard;

  return (
    <header
      className={`sticky top-0 z-30 border-b ${
        isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className={`rounded-lg p-2 transition lg:hidden ${
              isDark
                ? "text-gray-300 hover:bg-gray-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <h1
              className={`truncate text-xl font-bold sm:text-2xl ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {currentPage.title}
            </h1>

            <p
              className={`mt-1 hidden truncate text-sm sm:block ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {currentPage.description}
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`rounded-lg p-2 transition ${
              isDark
                ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {isDark ? <Sun size={21} /> : <Moon size={21} />}
          </button>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className={`relative rounded-lg p-2 transition ${
              isDark
                ? "text-gray-300 hover:bg-gray-800"
                : "text-gray-500 hover:bg-[#E8F0EF] hover:text-[#183D3D]"
            }`}
          >
            <Bell size={21} />
            <span
              className={`absolute right-2 top-2 h-2 w-2 rounded-full border-2 ${
                isDark ? "border-gray-900" : "border-white"
              } bg-red-500`}
            />
          </button>

          {/* Divider */}
          <div
            className={`hidden h-9 w-px sm:block ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            }`}
          />

          {/* Admin profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                isDark
                  ? "bg-gray-700 text-gray-200"
                  : "bg-[#E8F0EF] text-[#183D3D]"
              }`}
            >
              <UserCircle size={23} />
            </div>

            <div className="hidden sm:block">
              <p
                className={`text-sm font-semibold ${
                  isDark ? "text-gray-100" : "text-gray-800"
                }`}
              >
                Administrator
              </p>
              <p
                className={`text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Store Manager
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
