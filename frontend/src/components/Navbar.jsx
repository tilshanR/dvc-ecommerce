import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Smartphone,
  Monitor,
  BookOpen,
} from "lucide-react";
import PredictiveSearchBar from "./PredictiveSearchBar";

const categories = [
  {
    label: "Mobile Phones & Accessories",
    icon: Smartphone,
    href: "/shop?category=mobile",
  },
  {
    label: "Computer Hardware & Accessories",
    icon: Monitor,
    children: [
      {
        label: "New Computer Parts",
        href: "/shop?category=computer&condition=new",
      },
      {
        label: "Used Computer Parts",
        href: "/shop?category=computer&condition=used",
      },
      {
        label: "Computer Peripherals",
        href: "/shop?category=peripherals",
      },
    ],
  },
  {
    label: "Stationery",
    icon: BookOpen,
    href: "/shop?category=stationery",
  },
];

export const NavBar = () => {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [computerOpen, setComputerOpen] = useState(false);

  const closeMenus = () => {
    setCategoriesOpen(false);
    setComputerOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Top header */}
      <div className="bg-[#183d3d] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="shrink-0 text-xl font-bold tracking-wide text-white sm:text-2xl"
            onClick={closeMenus}
          >
            DVC <span className="font-normal">Store</span>
          </Link>

          <div className="hidden flex-1 justify-center px-6 md:flex">
            <PredictiveSearchBar />
          </div>

          <Link
            to="/cart"
            className="flex shrink-0 items-center gap-2 rounded-md px-2 py-2 text-sm transition hover:bg-white/10 sm:px-3"
          >
            <ShoppingCart size={21} />
            <span>Cart</span>
          </Link>
        </div>

        {/* Search on small screens */}
        <div className="px-4 pb-3 md:hidden">
          <PredictiveSearchBar />
        </div>
      </div>

      {/* Main navigation */}
      <nav
        aria-label="Main navigation"
        className="border-b border-gray-200 bg-white"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center px-3 sm:px-6">
          <div className="flex items-center justify-center gap-1 sm:gap-5">
            <Link
              to="/"
              onClick={closeMenus}
              className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800 transition hover:text-[#183d3d] sm:px-4 sm:text-base"
            >
              Home
            </Link>

            <Link
              to="/shop"
              onClick={closeMenus}
              className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800 transition hover:text-[#183d3d] sm:px-4 sm:text-base"
            >
              Shop All
            </Link>

            {/* Categories menu */}
            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => {
                setCategoriesOpen(false);
                setComputerOpen(false);
              }}
            >
              <button
                type="button"
                aria-expanded={categoriesOpen}
                onClick={() => setCategoriesOpen((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") closeMenus();
                }}
                className={`flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-4 text-sm font-medium transition sm:px-4 sm:text-base ${
                  categoriesOpen
                    ? "bg-[#183d3d] text-white"
                    : "text-gray-800 hover:bg-gray-100 hover:text-[#183d3d]"
                }`}
              >
                Categories
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    categoriesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {categoriesOpen && (
                <div className="absolute left-0 top-full z-[60] w-72 rounded-b-lg border border-gray-200 bg-white py-2 text-gray-800 shadow-xl">
                  {categories.map((category) => {
                    const Icon = category.icon;

                    if (category.children) {
                      return (
                        <div
                          key={category.label}
                          className="relative"
                          onMouseEnter={() => setComputerOpen(true)}
                          onMouseLeave={() => setComputerOpen(false)}
                        >
                          <button
                            type="button"
                            aria-expanded={computerOpen}
                            onClick={() =>
                              setComputerOpen((open) => !open)
                            }
                            onFocus={() => setComputerOpen(true)}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
                              computerOpen
                                ? "bg-[#e8f0ef] text-[#183d3d]"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            <Icon size={19} />
                            <span className="flex-1">
                              {category.label}
                            </span>
                            <ChevronRight size={16} />
                          </button>

                          {computerOpen && (
                            <div className="absolute left-full top-0 z-[70] w-60 rounded-lg border border-gray-200 bg-white py-2 shadow-xl">
                              {category.children.map((child) => (
                                <Link
                                  key={child.label}
                                  to={child.href}
                                  onClick={closeMenus}
                                  className="block px-4 py-3 text-sm transition hover:bg-[#e8f0ef] hover:text-[#183d3d]"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={category.label}
                        to={category.href}
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-gray-100 hover:text-[#183d3d]"
                      >
                        <Icon size={19} />
                        <span>{category.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              to="/contact-us"
              onClick={closeMenus}
              className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800 transition hover:text-[#183d3d] sm:px-4 sm:text-base"
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
