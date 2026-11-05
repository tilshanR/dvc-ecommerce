
import {
  LayoutDashboard,
  Package,
  Tags,
  Store,
  X,
  ChevronRight,
} from "lucide-react";

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
  },
  {
    id: "categories",
    label: "Categories",
    icon: Tags,
  },
];

export default function AdminSidebar({
  activeItem = "dashboard",
  onNavigate = () => {},
  isOpen = true,
  onClose = () => {},
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
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-gray-200 bg-white
          transition-transform duration-300
          lg:static lg:z-auto lg:translate-x-0
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-gray-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#183D3D] text-white">
              <Store size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-wide text-[#183D3D]">
                DVC Store
              </h1>
              <p className="text-xs font-medium tracking-wider text-gray-500">
                ADMIN PANEL
              </p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          <div>
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              General
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
                    className={`
                      flex w-full items-center gap-3 rounded-lg
                      px-3 py-3 text-left text-sm font-medium
                      transition-colors duration-200
                      ${
                        isActive
                          ? "bg-[#E8F0EF] text-[#183D3D]"
                          : "text-gray-600 hover:bg-gray-100 hover:text-[#183D3D]"
                      }
                    `}
                  >
                    <Icon
                      size={19}
                      className={
                        isActive ? "text-[#183D3D]" : "text-gray-500"
                      }
                    />

                    <span className="flex-1">{item.label}</span>

                    {isActive && (
                      <ChevronRight
                        size={16}
                        className="text-[#183D3D]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="rounded-lg bg-[#F5F8F7] p-3">
            <p className="text-sm font-semibold text-[#183D3D]">
              DVC Store Admin
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Product and category management
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
