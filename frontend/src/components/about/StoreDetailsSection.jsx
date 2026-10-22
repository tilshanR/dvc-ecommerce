import { Link } from "react-router-dom";
import { Clock, CreditCard, MapPin, MessageCircle, ShoppingBag } from "lucide-react";
import { BRAND } from "./Brand";
import SectionHeading from "./SectionHeading";

// STORE DETAILS
// --------------------------------------------------

export default function StoreDetailsSection() {
  const details = [
    {
      icon: MapPin,
      title: "Find our store",
      content: BRAND.address,
    },
    {
      icon: Clock,
      title: "Store hours",
      content: "Monday–Saturday: 8:00 AM – 8:00 PM",
    },
    {
      icon: CreditCard,
      title: "Shopping online",
      content:
        "Browse the catalog any time. Order processing and physical store services follow their applicable schedules.",
    },
  ];

  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Come say hello"
          title="Local roots. A wider reach."
          description="Whether you visit us in Palapathwela or browse our online catalog, we're glad you're here."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((detail) => {
            const Icon = detail.icon;

            return (
              <article
                key={detail.title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-800">
                  <Icon size={23} />
                </span>
                <h3 className="mt-5 font-bold text-slate-900">
                  {detail.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {detail.content}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-5 rounded-3xl bg-[#f8fafc] p-6 sm:flex-row sm:p-8">
          <div>
            <p className="font-bold text-slate-900">
              Have a question about a product?
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Browse our catalog or get in touch with the store.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/Shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-dvcGreen px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
            >
              <ShoppingBag size={17} />
              Shop All
            </Link>
            <Link
              to="/ContactUs"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-green-700"
            >
              <MessageCircle size={17} />
              Contact Us
            </Link>
          </div>
        </div>

        {(BRAND.phone || BRAND.email) && (
          <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm text-slate-600">
            {BRAND.phone && (
              <a
                href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
                className="hover:text-green-800"
              >
                Phone: {BRAND.phone}
              </a>
            )}
            {BRAND.email && (
              <a
                href={`mailto:${BRAND.email}`}
                className="hover:text-green-800"
              >
                Email: {BRAND.email}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// --------------------------------------------------
