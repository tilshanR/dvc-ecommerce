import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CheckCircle2, Cpu, Printer, Smartphone } from "lucide-react";
import SectionHeading from "./SectionHeading";

// WHAT WE OFFER: BENTO GRID
// --------------------------------------------------

const offerings = [
  {
    title: "Mobile Accessories & Smartphones",
    description:
      "Everyday essentials for keeping you connected, protected, and powered up.",
    details: [
      "Smartphones and feature phones",
      "Covers and screen protection",
      "Chargers, batteries, and cables",
    ],
    icon: Smartphone,
    className: "lg:col-span-2",
    featured: true,
  },
  {
    title: "PC Hardware & Tested Parts",
    description:
      "Options for different budgets, including brand-new components and pre-owned hardware with condition information.",
    details: ["RAM, SSDs, and HDDs", "GPUs and motherboards", "New and used options"],
    icon: Cpu,
    className: "lg:col-span-2",
    hardware: true,
  },
  {
    title: "School & Office Stationery",
    description:
      "Practical supplies for learning, creating, and getting everyday work done.",
    details: ["Pens and pencils", "Exercise and CR books", "Art and office supplies"],
    icon: BookOpen,
    className: "lg:col-span-2",
  },
  {
    title: "In-Store Community Services",
    description:
      "The familiar neighborhood services that have been part of DVC from the beginning.",
    details: [
      "Photocopying and printing",
      "Document scanning",
      "SIM reloads and bill payments",
    ],
    icon: Printer,
    className: "lg:col-span-2",
  },
];

export default function OfferingsSection() {
  return (
    <section className="bg-[#f8fafc] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="What we offer"
          title="A little bit of everything you need"
          description="From everyday stationery to essential tech, we bring useful products and local services together in one familiar place."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {offerings.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -5 }}
                className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl ${
                  item.className
                } ${
                  item.featured
                    ? "lg:col-span-2"
                    : item.hardware
                      ? "lg:col-span-2"
                      : ""
                }`}
              >
                {item.hardware && (
                  <span className="absolute right-4 top-4 rounded-full bg-dvcAmber/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#C45100]">
                    New &amp; Tested Used
                  </span>
                )}

                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 ${
                    item.hardware
                      ? "bg-orange-50 text-dvcAmber"
                      : "bg-green-50 text-dvcGreen"
                  }`}
                >
                  <Icon size={28} strokeWidth={1.7} />
                </div>

                <h3 className="max-w-sm text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>

                <ul className="mt-5 space-y-3">
                  {item.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0 text-green-700"
                      />
                      {detail}
                    </li>
                  ))}
                </ul>

                <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-green-50/70 transition-transform group-hover:scale-150" />
              </motion.article>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/Shop"
            className="inline-flex items-center gap-2 font-bold text-dvcGreen transition hover:gap-3"
          >
            Discover our catalog
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------
