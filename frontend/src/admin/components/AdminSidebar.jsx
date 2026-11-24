import {
  LayoutDashboard,
  Package,
  Tags,
  Store,
  X,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "orders", label: "Orders", icon: ShoppingCart },
];

export default function AdminSidebar({
  activeItem = "dashboard",
  onNavigate = () => {},
  isOpen = true,
  onClose = () => {},
  isDark = false,
}) {
  const handleNavigation = (itemId) => {
    onNavigate(itemId);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-(--admin-overlay) lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-(--admin-border) bg-(--admin-surface) transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-(--admin-border) px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--admin-brand) text-white">
              <Store size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-wide text-(--admin-brand-text)">
                DVC Store
              </h1>
              <p className="text-xs font-medium tracking-wider text-(--admin-muted)">
                ADMIN PANEL
              </p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-(--admin-muted) transition hover:bg-(--admin-hover) hover:text-(--admin-text) lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          <div>
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-(--admin-muted)">
              Operations
            </p>

            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigation(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-(--admin-brand) text-white shadow-xs"
                        : "text-(--admin-muted) hover:bg-(--admin-hover) hover:text-(--admin-text)"
                    }`}
                  >
                    <Icon
                      size={19}
                      className={isActive ? "text-white" : "text-current"}
                    />

                    <span className="flex-1">{item.label}</span>

                    {isActive && <ChevronRight size={16} />}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-(--admin-border) p-4">
          <div className="rounded-lg bg-(--admin-brand-soft) p-3">
            <p className="text-sm font-semibold text-(--admin-brand-text)">
              DVC Store Admin
            </p>
            <p className="mt-1 text-xs text-(--admin-muted)">
              Orders, catalog, and store operations
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
