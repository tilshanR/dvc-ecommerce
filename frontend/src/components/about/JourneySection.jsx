import { motion, useReducedMotion } from "framer-motion";
import { Store, Smartphone, Cpu, Zap } from "lucide-react";
import SectionHeading from "./SectionHeading";

// TIMELINE: SCROLL-BEAM-INSPIRED PATTERN
// --------------------------------------------------

const milestones = [
  {
    year: "2014",
    title: "The Neighborhood Counter",
    description:
      "DVC began at No. 8 Dambulla Road, Palapathwela, with SIM reloads, document printing, photocopying, and utility bill payments. The mission was simple: help our neighbors with the everyday services they needed.",
    icon: Store,
    tag: "Our beginning",
  },
  {
    year: "2018",
    title: "The Tech Expansion",
    description:
      "We expanded our offering to mobile phone accessories, chargers, tempered glass, feature phones, and stationery—growing alongside the needs of local families, students, and workers.",
    icon: Smartphone,
    tag: "Growing together",
  },
  {
    year: "2022",
    title: "A Commitment to Tested Hardware",
    description:
      "We developed our focus on pre-owned PC components, with physical checks and testing intended to help students and tech enthusiasts make more informed, budget-conscious hardware choices.",
    icon: Cpu,
    tag: "Confidence in every component",
  },
  {
    year: "2026",
    title: "The Digital Era",
    description:
      "DVC moves into online retail with a digital catalog, product search, inventory visibility, and a more convenient way for customers to discover products beyond traditional store hours.",
    icon: Zap,
    tag: "Open to new possibilities",
  },
];

export default function JourneySection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Our journey"
          title="Twelve years. One promise."
          description="Every chapter brought new products, new challenges, and new opportunities to earn our community's trust."
        />

        <div className="relative">
          {/* Decorative timeline rail and animated beam */}
          <div className="absolute bottom-8 left-[4.75] top-8 w-px bg-slate-200 sm:left-1/2 sm:-translate-x-1/2" />

          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: "90%" }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              duration: reduceMotion ? 0 : 1.6,
              ease: "easeInOut",
            }}
            className="absolute left-[4.75] top-8 w-0.75 origin-top rounded-full bg-linear-to-b from-green-400 via-dvcGreen to-amber-400 sm:left-1/2 sm:-translate-x-1/2"
          />

          <div className="space-y-10 sm:space-y-14">
            {milestones.map((item, index) => {
              const Icon = item.icon;
              const reverse = index % 2 === 1;

              return (
                <motion.article
                  key={item.year}
                  initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                  className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-4 sm:grid-cols-[1fr_48px_1fr] sm:gap-5"
                >
                  <div
                    className={`hidden min-w-0 sm:block ${
                      reverse ? "sm:col-start-3" : "sm:col-start-1"
                    }`}
                  >
                    <div
                      className={`rounded-2xl border border-slate-100 bg-[#f8fafc] p-6 ${
                        reverse ? "" : "sm:text-right"
                      }`}
                    >
                      <span className="text-3xl font-black text-dvcGreen">
                        {item.year}
                      </span>
                      <h3 className="mt-2 text-xl font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {item.description}
                      </p>
                      <span className="mt-4 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">
                        {item.tag}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 col-start-1 flex justify-center sm:col-start-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-dvcGreen text-white shadow-md sm:h-12 sm:w-12">
                      <Icon size={19} />
                    </span>
                  </div>

                  <div className="min-w-0 sm:hidden">
                    <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-5">
                      <span className="text-2xl font-black text-dvcGreen">
                        {item.year}
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {item.description}
                      </p>
                      <span className="mt-4 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------
