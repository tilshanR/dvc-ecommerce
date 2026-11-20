import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
  Smartphone,
  Monitor,
  BookOpen,
} from "lucide-react";
import PredictiveSearchBar from "./PredictiveSearchBar";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const primaryLinks = [
  { label: "Home", to: "/", end: true },
  { label: "Shop all", to: "/shop", end: true },
];

const categories = [
  {
    label: "Mobile phones & accessories",
    icon: Smartphone,
    href: "/shop?category=mobile",
  },
  {
    label: "Computer hardware & accessories",
    icon: Monitor,
    children: [
      { label: "New computer parts", href: "/shop?category=computer&condition=new" },
      { label: "Used computer parts", href: "/shop?category=computer&condition=used" },
      { label: "Computer peripherals", href: "/shop?category=peripherals" },
    ],
  },
  {
    label: "Stationery",
    icon: BookOpen,
    href: "/shop?category=stationery",
  },
];

/* ------------------------------------------------------------------ */
/* Shared styles                                                       */
/* ------------------------------------------------------------------ */

const container = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

// Desktop nav item: matches the 64px header row so active underlines sit flush on the bottom border.
const desktopItem =
  "relative inline-flex h-16 shrink-0 items-center gap-1.5 whitespace-nowrap px-3 text-sm font-medium " +
  "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-inset focus-visible:ring-[#8fd6bf] " +
  "after:absolute after:inset-x-3 after:-bottom-px after:h-[2.5px] after:origin-left " +
  "after:scale-x-0 after:rounded-t-full after:bg-[#8fd6bf] after:transition-transform after:duration-200 " +
  "hover:after:scale-x-100";

const desktopItemState = (active) =>
  active ? "font-semibold text-white after:scale-x-100" : "text-white/80 hover:text-white";

const iconButton =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium " +
  "text-white/90 transition-colors duration-150 hover:bg-white/10 hover:text-white " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd6bf]";

const mobileItem =
  "flex min-h-[44px] w-full items-center justify-between rounded-xl px-3.5 text-[15px] " +
  "font-medium transition-colors duration-150 focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-[#8fd6bf]";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export const NavBar = ({ cartCount = 0 }) => {
  const location = useLocation();

  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const categoriesRef = useRef(null);
  const categoriesButtonRef = useRef(null);
  const searchWrapRef = useRef(null);
  const searchButtonRef = useRef(null);
  const hoverTimer = useRef(null);
  const openedByHover = useRef(false);

  const closeAll = () => {
    setCategoriesOpen(false);
    setMobileOpen(false);
    setMobileCategoriesOpen(false);
    setSearchOpen(false);
  };

  const openSearch = () => {
    setCategoriesOpen(false);
    setMobileOpen(false);
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    requestAnimationFrame(() => {
      searchButtonRef.current?.focus();
    });
  };

  // Close everything on navigation (this also closes search after a submit)
  useEffect(() => {
    closeAll();
  }, [location.pathname, location.search]);

  // Clear pending hover timeout on unmount
  useEffect(() => {
    return () => clearTimeout(hoverTimer.current);
  }, []);

  // Focus the search input as soon as the search opens
  useEffect(() => {
    if (!searchOpen) return;
    const id = requestAnimationFrame(() => {
      searchWrapRef.current?.querySelector("input")?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [searchOpen]);

  // Global listeners: outside click, Escape, and "/" to open search
  useEffect(() => {
    const onMouseDown = (e) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
      if (searchOpen && searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        // Ignore the search button itself, it handles its own toggle
        if (!searchButtonRef.current?.contains(e.target)) setSearchOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (searchOpen) {
          closeSearch();
        } else if (categoriesOpen) {
          setCategoriesOpen(false);
          categoriesButtonRef.current?.focus();
        } else if (mobileOpen) {
          setMobileOpen(false);
        }
        return;
      }

      // "/" opens search unless the user is already typing somewhere
      const tag = e.target?.tagName;
      const typing =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target?.isContentEditable;
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openSearch();
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [searchOpen, categoriesOpen, mobileOpen]);

  // Hover with a short grace period so the menu doesn't flicker shut
  const handleEnter = (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    clearTimeout(hoverTimer.current);
    openedByHover.current = !categoriesOpen;
    setCategoriesOpen(true);
  };

  const handleLeave = (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    hoverTimer.current = setTimeout(() => {
      setCategoriesOpen(false);
      openedByHover.current = false;
    }, 150);
  };

  const handleCategoriesClick = () => {
    if (openedByHover.current) {
      openedByHover.current = false;
      return;
    }
    setCategoriesOpen((o) => !o);
  };

  const currentUrl = `${location.pathname}${location.search}`;
  const shopCategoryActive =
    location.pathname === "/shop" && location.search.includes("category=");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/15 bg-[#183d3d]/95 text-white shadow-sm shadow-black/15 backdrop-blur-md">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2.5 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3.5 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#183d3d] focus:shadow-md"
      >
        Skip to content
      </a>

      {/* ---------------- Main row (all components stay visible when search expands) ---------------- */}
      <div className={`${container} flex flex-wrap items-center lg:flex-nowrap lg:gap-4`}>
        {/* Left: mobile menu toggle, brand logo, and desktop navigation */}
        <div className="order-1 flex h-16 min-w-0 items-center gap-2 lg:gap-6 xl:gap-8">
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((o) => !o)}
            className={`${iconButton} -ml-2 w-10 px-0 lg:hidden`}
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <Link
            to="/"
            className="inline-flex shrink-0 items-baseline gap-1 rounded-lg py-1 text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd6bf] sm:text-2xl"
          >
            <span>DVC</span>
            <span className="font-medium text-[#8fd6bf]">Store</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {primaryLinks.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `${desktopItem} ${desktopItemState(isActive && !shopCategoryActive)}`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}

              {/* Categories dropdown */}
              <li
                ref={categoriesRef}
                className="relative"
                onPointerEnter={handleEnter}
                onPointerLeave={handleLeave}
              >
                <button
                  ref={categoriesButtonRef}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={categoriesOpen}
                  aria-controls="categories-menu"
                  onClick={handleCategoriesClick}
                  className={`${desktopItem} ${desktopItemState(
                    categoriesOpen || shopCategoryActive
                  )}`}
                >
                  <span>Categories</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${
                      categoriesOpen
                        ? "rotate-180 text-[#8fd6bf]"
                        : shopCategoryActive
                        ? "text-[#8fd6bf]"
                        : "text-white/60"
                    }`}
                  />
                </button>

                {categoriesOpen && (
                  /* Invisible pt-2 hover bridge prevents flicker between trigger and floating menu */
                  <div className="absolute left-0 top-full z-50 w-86 pt-2">
                    <div
                      id="categories-menu"
                      className="rounded-2xl border border-slate-200/90 bg-white p-2 text-slate-900 shadow-2xl shadow-black/20 ring-1 ring-black/5"
                    >
                      <div className="space-y-0.5">
                        {categories.map((category) => {
                          const Icon = category.icon;
                          const isDirectActive = category.href && currentUrl === category.href;
                          const isChildGroupActive = category.children?.some(
                            (child) => currentUrl === child.href
                          );

                          if (category.children) {
                            return (
                              <div key={category.label} className="rounded-xl p-1">
                                <div className="flex items-center gap-3 px-2 py-1.5 text-sm font-semibold text-slate-800">
                                  <span
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                      isChildGroupActive
                                        ? "bg-[#183d3d] text-white"
                                        : "bg-[#e8f0ef] text-[#183d3d]"
                                    }`}
                                  >
                                    <Icon size={17} />
                                  </span>
                                  <span>{category.label}</span>
                                </div>
                                <ul className="ml-6 mt-1 space-y-0.5 border-l-2 border-[#183d3d]/15 pl-4">
                                  {category.children.map((child) => {
                                    const isChildActive = currentUrl === child.href;
                                    return (
                                      <li key={child.label}>
                                        <Link
                                          to={child.href}
                                          className={`block rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183d3d] ${
                                            isChildActive
                                              ? "bg-[#e8f0ef] font-semibold text-[#183d3d]"
                                              : "text-slate-600 hover:bg-[#e8f0ef]/70 hover:text-[#183d3d]"
                                          }`}
                                        >
                                          {child.label}
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            );
                          }

                          return (
                            <Link
                              key={category.label}
                              to={category.href}
                              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183d3d] ${
                                isDirectActive
                                  ? "bg-[#e8f0ef] font-semibold text-[#183d3d]"
                                  : "text-slate-700 hover:bg-[#e8f0ef]/70 hover:text-[#183d3d]"
                              }`}
                            >
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${
                                  isDirectActive
                                    ? "bg-[#183d3d] text-white"
                                    : "bg-[#e8f0ef] text-[#183d3d] group-hover:bg-[#183d3d] group-hover:text-white"
                                }`}
                              >
                                <Icon size={17} />
                              </span>
                              <span>{category.label}</span>
                            </Link>
                          );
                        })}
                      </div>

                      <div className="mt-2 border-t border-slate-100 pt-2">
                        <Link
                          to="/shop"
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-[#183d3d] transition-colors duration-150 hover:bg-[#e8f0ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183d3d]"
                        >
                          <span>Browse all products</span>
                          <span aria-hidden="true">&rarr;</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </li>

              <li>
                <NavLink
                  to="/contact-us"
                  className={({ isActive }) => `${desktopItem} ${desktopItemState(isActive)}`}
                >
                  Contact
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>

        {/* Inline expandable search: expands alongside nav + cart on desktop, attached row below on mobile */}
        <div
          role="search"
          ref={searchWrapRef}
          className={`order-3 basis-full transition-all duration-200 ease-out lg:order-2 lg:ml-auto lg:basis-auto ${
            searchOpen
              ? "max-h-24 overflow-visible border-t border-white/10 py-2.5 opacity-100 lg:w-64 lg:border-t-0 lg:py-0 xl:w-80"
              : "pointer-events-none max-h-0 overflow-hidden opacity-0 lg:w-0"
          }`}
        >
          {searchOpen && (
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <PredictiveSearchBar />
              </div>
              <button
                type="button"
                aria-label="Close search"
                onClick={closeSearch}
                className={`${iconButton} h-9 w-9 shrink-0 px-0`}
              >
                <X size={19} />
              </button>
            </div>
          )}
        </div>

        {/* Right: search trigger + cart (always visible) */}
        <div className="order-2 ml-auto flex h-16 shrink-0 items-center gap-1.5 sm:gap-2 lg:order-3 lg:ml-0">
          {!searchOpen && (
            <button
              ref={searchButtonRef}
              type="button"
              aria-label="Search products"
              aria-expanded={searchOpen}
              title="Search (press /)"
              onClick={openSearch}
              className="inline-flex h-10 w-10 items-center justify-center gap-2 rounded-lg text-sm font-medium text-white/90 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fd6bf] sm:w-auto sm:border sm:border-white/15 sm:bg-white/6 sm:px-3.5 sm:hover:border-white/25 sm:hover:bg-white/15"
            >
              <Search size={18} className="shrink-0 text-[#8fd6bf]" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-sans text-[11px] font-medium leading-none text-white/75 xl:inline-block">
                /
              </kbd>
            </button>
          )}

          <Link
            to="/cart"
            aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart, empty"}
            className={`${iconButton} px-2.5 sm:px-3`}
          >
            <span className="relative inline-flex items-center justify-center">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-2.5 -top-2 flex h-18px min-w-4.5 items-center justify-center rounded-full bg-[#8fd6bf] px-1 text-[10px] font-bold leading-none text-[#183d3d] ring-2 ring-[#183d3d]">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </div>
      </div>

      {/* ---------------- Mobile drawer + backdrop ---------------- */}
      {mobileOpen && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
          />

          <nav
            id="mobile-menu"
            aria-label="Main navigation"
            className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 bg-[#183d3d] shadow-2xl lg:hidden"
          >
            <ul className={`${container} space-y-1 py-3.5`}>
              {primaryLinks.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `${mobileItem} ${
                        isActive && !shopCategoryActive
                          ? "bg-white/15 font-semibold text-white"
                          : "text-white/85 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}

              <li>
                <button
                  type="button"
                  aria-expanded={mobileCategoriesOpen}
                  onClick={() => setMobileCategoriesOpen((o) => !o)}
                  className={`${mobileItem} ${
                    mobileCategoriesOpen || shopCategoryActive
                      ? "bg-white/10 font-semibold text-white"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>Categories</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${
                      mobileCategoriesOpen ? "rotate-180 text-[#8fd6bf]" : "text-white/60"
                    }`}
                  />
                </button>

                {mobileCategoriesOpen && (
                  <ul className="mt-1.5 ml-3 space-y-1 border-l-2 border-white/15 pl-3">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const isDirectActive = category.href && currentUrl === category.href;

                      if (category.children) {
                        return (
                          <li key={category.label} className="py-1">
                            <div className="flex min-h-10 items-center gap-3 px-3 text-sm font-semibold text-white">
                              <Icon size={17} className="shrink-0 text-[#8fd6bf]" />
                              <span>{category.label}</span>
                            </div>
                            <ul className="mt-0.5 ml-7 space-y-0.5">
                              {category.children.map((child) => {
                                const isChildActive = currentUrl === child.href;
                                return (
                                  <li key={child.label}>
                                    <Link
                                      to={child.href}
                                      className={`flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors duration-150 ${
                                        isChildActive
                                          ? "bg-white/15 font-semibold text-white"
                                          : "text-white/75 hover:bg-white/10 hover:text-white"
                                      }`}
                                    >
                                      {child.label}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </li>
                        );
                      }

                      return (
                        <li key={category.label}>
                          <Link
                            to={category.href}
                            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 ${
                              isDirectActive
                                ? "bg-white/15 font-semibold text-white"
                                : "text-white/90 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <Icon size={17} className="shrink-0 text-[#8fd6bf]" />
                            <span>{category.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>

              <li>
                <NavLink
                  to="/contact-us"
                  className={({ isActive }) =>
                    `${mobileItem} ${
                      isActive
                        ? "bg-white/15 font-semibold text-white"
                        : "text-white/85 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  Contact
                </NavLink>
              </li>
            </ul>
          </nav>
        </>
      )}
    </header>
  );
};

export default NavBar;