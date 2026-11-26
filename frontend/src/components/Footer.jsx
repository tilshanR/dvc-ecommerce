import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicStoreSettings } from "../services/storeSettingsApi";
import {
  DEFAULT_PUBLIC_SETTINGS,
  formatHoldHours,
} from "../utils/checkoutUtils";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Smartphone,
  Monitor,
  BookOpen,
  Truck,
  ShoppingBag,
  ArrowUpRight,
  Headphones,
  Tag,
} from "lucide-react";
import useCategories from "../hooks/useCategories";

const navigationLinks = [
  { label: "Home", to: "/" },
  { label: "Shop All", to: "/shop" },
  { label: "About Us", to: "/aboutus" },
  { label: "Contact Us", to: "/contact-us" },
  { label: "FAQ & Pickup Policy", to: "/faq" },
  { label: "Terms & Conditions", to: "/terms" },
];

const categoryIcons = {
  "mobile-phones": Smartphone,
  "mobile-accessories": Headphones,
  "computer-hardware": Monitor,
  stationery: BookOpen,
};

const MAX_FOOTER_CATEGORIES = 6;

// Used only if the API fails
const fallbackCategories = [
  {
    label: "Mobile Phones",
    to: "/shop?category=mobile-phones",
    icon: Smartphone,
  },
  {
    label: "Mobile Accessories",
    to: "/shop?category=mobile-accessories",
    icon: Headphones,
  },
  {
    label: "Computer Hardware",
    to: "/shop?category=computer-hardware",
    icon: Monitor,
  },
  { label: "Stationery", to: "/shop?category=stationery", icon: BookOpen },
];

const buildFulfillmentOptions = (orderPolicies) => [
  {
    label: "Home Delivery",
    detail: "Online payment · District & weight rates",
    icon: Truck,
  },
  {
    label: "Prepaid In-Store Pickup",
    detail: "Pay online, collect in-store",
    icon: ShoppingBag,
  },
  {
    label: "Reserve & Pay In-Store",
    detail: orderPolicies?.autoCancelStorePickup
      ? `Held for ${formatHoldHours(orderPolicies.storePickupHoldHours)}`
      : "Reserved until counter collection",
    icon: Clock,
  },
];

const MAP_URL = import.meta.env.VITE_MAP_URL;

const linkClass =
  "group flex min-h-11 items-center gap-2 rounded-sm py-2 text-sm " +
  "text-white/80 transition-colors hover:text-white " +
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-white";

function FooterSection({ title, children }) {
  return (
    <section className="min-w-0">
      <h2 className="text-sm font-semibold tracking-wide text-white">
        {title}
      </h2>
      <div className="mb-3 mt-3 h-px w-full bg-white/20" />
      {children}
    </section>
  );
}

function Footer() {
  const [orderPolicies, setOrderPolicies] = useState(
    DEFAULT_PUBLIC_SETTINGS.orderPolicies,
  );

  useEffect(() => {
    let isMounted = true;
    getPublicStoreSettings()
      .then((res) => {
        if (isMounted && res?.data?.orderPolicies) {
          setOrderPolicies(res.data.orderPolicies);
        }
      })
      .catch(() => {
        // Keep safe default policy copy if API is temporarily unreachable
      });

    return () => {
      isMounted = false;
    };
  }, []);
  const { categories, isLoading, isError } = useCategories();

  const footerCategories =
    isError || categories.length === 0
      ? fallbackCategories
      : [...categories]
          .filter((c) => c.status !== "archived")
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .slice(0, MAX_FOOTER_CATEGORIES)
          .map((c) => ({
            label: c.name,
            to: `/shop?category=${c.slug}`,
            icon: categoryIcons[c.slug] ?? Tag,
          }));

  const fulfillmentOptions = buildFulfillmentOptions(orderPolicies);

  return (
    <footer className="bg-[#183d3d] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-8 sm:px-8 lg:px-10">
        {/* Brand */}
        <div className="flex flex-col gap-2 border-b border-white/20 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="w-fit rounded-sm text-xl font-bold tracking-wide text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            DVC <span className="font-normal">Store</span>
          </Link>

          <p className="text-sm italic text-white/80">
            Moving forward with Trust
          </p>
        </div>

        {/* Consistent four-column layout */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 border-b border-white/20 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Navigation */}
          <FooterSection title="Quick Navigation">
            <nav aria-label="Footer navigation">
              <ul className="space-y-1">
                {navigationLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className={linkClass}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </FooterSection>

          {/* Column 2: Categories */}
          <FooterSection title="Product Categories">
            {isLoading ? (
              <div className="space-y-3" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-5 w-3/4 animate-pulse rounded bg-white/10"
                  />
                ))}
              </div>
            ) : (
              <ul className="space-y-1">
                {footerCategories.map(({ label, to, icon: Icon }) => (
                  <li key={to}>
                    <Link to={to} className={linkClass}>
                      <Icon
                        size={17}
                        className="shrink-0 text-white/70"
                        aria-hidden="true"
                      />
                      <span>{label}</span>
                      <ArrowUpRight
                        size={13}
                        className="ml-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/shop"
                    className={`${linkClass} font-medium text-white`}
                  >
                    View all products
                  </Link>
                </li>
              </ul>
            )}
          </FooterSection>

          {/* Column 3: Contact */}
          <FooterSection title="Visit Our Store">
            <address className="space-y-4 not-italic">
              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-1 shrink-0 text-white/80"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm leading-6 text-white/90">
                    No. 8 Dambulla Road,
                    <br />
                    Palapathwela (21070),
                    <br />
                    Matale, Sri Lanka
                  </p>

                  <a
                    href={MAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-white underline underline-offset-4 hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Get directions
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone
                  size={17}
                  className="mt-1 shrink-0 text-white/80"
                  aria-hidden="true"
                />
                <p className="text-sm leading-6 text-white/90">
                  +94 66 228 4xxx
                  <br />
                  +94 77 xxx xxxx
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Mail
                  size={17}
                  className="mt-1 shrink-0 text-white/80"
                  aria-hidden="true"
                />
                <a
                  href="mailto:info@dvcecommerce.lk"
                  className="min-h-11 break-all py-1 text-sm text-white/90 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  info@dvcecommerce.lk
                </a>
              </div>
            </address>
          </FooterSection>

          {/* Column 4: Hours and fulfillment */}
          <FooterSection title="Store Hours & Pickup">
            <div className="flex items-start gap-3">
              <Clock
                size={18}
                className="mt-1 shrink-0 text-white/80"
                aria-hidden="true"
              />
              <div className="text-sm leading-6 text-white/90">
                <p className="font-medium text-white">Monday – Saturday</p>
                <p>8:00 AM – 8:00 PM</p>
                <p className="mt-2 text-white/70">
                  Sundays & public holidays: Closed.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {fulfillmentOptions.map(({ label, detail, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon
                    size={17}
                    className="mt-0.5 shrink-0 text-white/80"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-white/70">
                      {detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FooterSection>
        </div>

        {/* Payment methods */}
        <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Payment Methods
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/80">
              <span>PayHere</span>
              <span>Visa</span>
              <span>Mastercard</span>
              <span>Cash on Pickup</span>
            </div>
          </div>

          <p className="text-xs text-white/70">
            Prices in Sri Lankan Rupees (LKR).
          </p>
        </div>
      </div>

      {/* Centered copyright */}
      <div className="border-t border-white/20 px-5 py-5">
        <p className="mx-auto max-w-4xl text-center text-xs leading-6 text-white/75 sm:text-sm">
          © 2026 Dhanuka Video & Communication (DVC). Developed for
          Palapathwela, Sri Lanka. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
