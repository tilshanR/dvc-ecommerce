import { Link } from "react-router-dom";
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
} from "lucide-react";

const navigationLinks = [
  { label: "Home", to: "/" },
  { label: "Shop All", to: "/shop" },
  { label: "About Us", to: "/aboutus" },
  { label: "Contact Us", to: "/contact-us" },
  { label: "FAQ & Pickup Policy", to: "/faq" },
  { label: "Terms & Conditions", to: "/terms" },
];

const productCategories = [
  {
    label: "Mobile Phones & Accessories",
    to: "/shop?category=mobile",
    icon: Smartphone,
  },
  {
    label: "New Computer Parts",
    to: "/shop?category=computer&condition=new",
    icon: Monitor,
  },
  {
    label: "Used Computer Parts",
    to: "/shop?category=computer&condition=used",
    icon: Monitor,
  },
  {
    label: "Stationery",
    to: "/shop?category=stationery",
    icon: BookOpen,
  },
];

const fulfillmentOptions = [
  {
    label: "Home Delivery",
    detail: "Online payment",
    icon: Truck,
  },
  {
    label: "Prepaid In-Store Pickup",
    detail: "Pay online, collect in-store",
    icon: ShoppingBag,
  },
  {
    label: "Reserve & Pay In-Store",
    detail: "Held for 2 business days",
    icon: Clock,
  },
];

const linkClass =
  "flex min-h-11 items-center gap-2 rounded-sm py-2 text-sm " +
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
            <ul className="space-y-1">
              {productCategories.map(({ label, to, icon: Icon }) => (
                <li key={label}>
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
            </ul>
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
                    href="https://www.google.com/maps/search/?api=1&query=No.+8+Dambulla+Road%2C+Palapathwela%2C+Matale%2C+Sri+Lanka"
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
                <p className="font-medium text-white">
                  Monday – Saturday
                </p>
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
                    <p className="text-sm font-medium text-white">
                      {label}
                    </p>
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
