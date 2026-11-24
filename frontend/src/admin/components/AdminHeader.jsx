import { Menu, UserCircle, Sun, Moon, LogOut } from "lucide-react";

const pageDetails = {
  dashboard: {
    title: "Dashboard",
    description: "Overview of your store operations, orders, and catalog.",
  },
  products: {
    title: "Products",
    description: "Manage your store products and inventory.",
  },
  categories: {
    title: "Categories",
    description: "Organize and manage your product categories.",
  },
  orders: {
    title: "Orders",
    description: "Track customer orders, fulfillment, and payment statuses.",
  },
};
export default function AdminHeader({
  activePage = "dashboard",
  onMenuClick = () => {},
  isDark = false,
  onToggleTheme = () => {},
  admin = null,
  onLogout = () => {},
  loggingOut = false,
}) {
  const currentPage = pageDetails[activePage] || pageDetails.dashboard;

  return (
    <header className="sticky top-0 z-30 border-b border-(--admin-border) bg-(--admin-surface) transition-colors duration-200">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="rounded-lg p-2 text-(--admin-muted) transition hover:bg-(--admin-hover) hover:text-(--admin-text) lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-(--admin-text) sm:text-2xl">
              {currentPage.title}
            </h1>

            <p className="mt-1 hidden truncate text-sm text-(--admin-muted) sm:block">
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
            className="rounded-lg p-2 text-(--admin-muted) transition hover:bg-(--admin-hover) hover:text-(--admin-text)"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Divider */}
          <div className="hidden h-9 w-px bg-(--admin-border) sm:block" />

          {/* Admin profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--admin-brand-soft) text-(--admin-brand-text)">
              <UserCircle size={22} />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-(--admin-text)">
                {admin?.name || "Administrator"}
              </p>
              <p className="text-xs capitalize text-(--admin-muted)">
                {admin?.role ? admin.role.replace("_", " ") : "Store Manager"}
              </p>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              disabled={loggingOut}
              aria-label="Log out"
              title="Log out"
              className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-2 text-sm font-medium text-(--admin-status-danger-text) transition hover:border-(--admin-status-danger-border) hover:bg-(--admin-status-danger-bg) disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">
                {loggingOut ? "Signing out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
