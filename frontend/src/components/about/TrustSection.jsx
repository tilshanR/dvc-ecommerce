import { motion } from "framer-motion";
import { Banknote, ShieldCheck, Store, Wrench } from "lucide-react";
import SectionHeading from "./SectionHeading";

// TRUST CARDS: WOBBLE-INSPIRED HOVER EFFECT
// --------------------------------------------------

const trustFeatures = [
  {
    code: "BR-001",
    title: "Reserve & Pay In-Store",
    description:
      "Where the reservation option is available, request a hold, inspect your item in person, and pay at the shop under the applicable reservation terms.",
    icon: Store,
    accent: "green",
  },
  {
    code: "QUALITY",
    title: "Tested Used Hardware",
    description:
      "Pre-owned components should be checked and their condition clearly described before listing, helping customers make informed purchasing decisions.",
    icon: Wrench,
    accent: "amber",
  },
  {
    code: "PRICING",
    title: "Transparent LKR Pricing",
    description:
      "See product prices in Sri Lankan Rupees and review applicable delivery fees before completing your order.",
    icon: Banknote,
    accent: "green",
  },
];

export default function TrustSection() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Why local trust matters"
          title="Confidence is part of the purchase"
          description="We believe good service means clear information, realistic expectations, and accountability beyond the checkout button."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {trustFeatures.map((item, index) => {
            const Icon = item.icon;
            const amber = item.accent === "amber";

            return (
              <motion.article
                key={item.code}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
                style={{ transformStyle: "preserve-3d" }}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-xl sm:p-8"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                      amber
                        ? "bg-orange-50 text-dvcAmber"
                        : "bg-green-50 text-dvcGreen"
                    }`}
                  >
                    <Icon size={27} />
                  </span>
                  <span
                    className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-widest ${
                      amber
                        ? "bg-orange-50 text-orange-800"
                        : "bg-green-50 text-green-800"
                    }`}
                  >
                    {item.code}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <ShieldCheck size={18} className="text-green-700" />
                  Clear expectations matter
                </div>
              </motion.article>
            );
          })}
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-6 text-slate-500">
          Reservation availability, holding periods, payment options, testing
          procedures, and warranty terms should be confirmed in the applicable
          product and checkout policies before being offered as guarantees.
        </p>
      </div>
    </section>
  );
}

// --------------------------------------------------
