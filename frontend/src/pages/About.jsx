
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Banknote,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  CreditCard,
  FileCheck,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Monitor,
  PackageCheck,
  Printer,
  Quote,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Store,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";

// --------------------------------------------------
// DVC BRAND CONFIGURATION
// Replace the contact placeholders with verified details.
// --------------------------------------------------

const BRAND = {
  name: "Dhanuka Video & Communication",
  shortName: "DVC Store",
  owner: "Mr. Dhanuka Bandara",
  motto: "Moving forward with Trust",
  address: "No. 8 Dambulla Road, Palapathwela, Matale 21070, Sri Lanka",
  phone: "", // Add the verified store telephone number.
  email: "", // Add the verified store email address.
};

const GREEN = "#2E7D32";
const AMBER = "#EF6C00";

// --------------------------------------------------
// REUSABLE SECTION HEADING
// --------------------------------------------------

function SectionHeading({ eyebrow, title, description, light = false }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span
        className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] ${
          light
            ? "bg-white/10 text-green-100"
            : "bg-green-50 text-green-800"
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#EF6C00]" />
        {eyebrow}
      </span>

      <h2
        className={`text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`mt-4 text-base leading-7 sm:text-lg ${
            light ? "text-green-50/80" : "text-slate-600"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

// --------------------------------------------------
// HERO: FLIP WORDS-INSPIRED ANIMATION
// --------------------------------------------------

function HeroSection() {
  const words = ["Trust", "Quality", "Heritage", "Innovation"];
  const [activeWord, setActiveWord] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveWord((current) => (current + 1) % words.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, [reduceMotion, words.length]);

  return (
    <section className="relative isolate overflow-hidden bg-[#f8fafc]">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-green-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-orange-100/60 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10 lg:py-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-800 shadow-sm">
            <BadgeCheck size={17} />
            Proudly rooted in Palapathwela since 2014
          </div>

          <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Rooted in Palapathwela,
            <span className="mt-2 block text-[#2E7D32]">
              Driven by{" "}
              <span className="inline-block min-w-[5ch]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={words[activeWord]}
                    initial={reduceMotion ? false : { opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="inline-block"
                  >
                    {words[activeWord]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            Since 2014, Dhanuka Video &amp; Communication has been a
            trusted presence on Dambulla Road. Today, we bring that same
            face-to-face honesty to your screen—with our digital storefront
            designed to serve you beyond store hours.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/Shop"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-dvcGreen px-6 py-3 font-bold text-white shadow-lg shadow-green-900/15 transition hover:-translate-y-0.5 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
            >
              Explore Catalog
              <ArrowRight size={18} />
            </Link>

            <a
              href="https://www.google.com/maps/search/?api=1&query=No.+8+Dambulla+Road+Palapathwela+Matale+Sri+Lanka"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-800 transition hover:border-green-700 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
            >
              <MapPin size={18} />
              Visit Our Store
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-700" />
              Local accountability
            </span>
            <span className="inline-flex items-center gap-2">
              <Banknote size={18} className="text-green-700" />
              Clear LKR pricing
            </span>
          </div>
        </motion.div>

        {/* Image placeholder: replace with a real shop photograph later. */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto w-full max-w-lg"
        >
          <div className="absolute -inset-3 rotate-3 rounded-4xl bg-linear-to-br from-green-200 via-amber-100 to-green-100" />

          <div className="relative flex aspect-[4/4.2] flex-col justify-between overflow-hidden rounded-[1.6rem] bg-linear-to-br from-[#183d3d] via-[#245b43] to-dvcGreen p-6 text-white shadow-2xl sm:p-9">
            <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full border border-white/10" />
            <div className="absolute -right-2 -top-2 h-36 w-36 rounded-full border border-white/10" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/5" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <Store size={15} />
                A local story since 2014
              </span>

              <div className="mt-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-inner">
                <ShoppingBag size={48} strokeWidth={1.4} />
              </div>

              <h2 className="mt-6 text-3xl font-black sm:text-4xl">
                DVC Store
              </h2>
              <p className="mt-2 max-w-xs leading-7 text-green-50/90">
                From a neighborhood counter to your digital doorstep.
              </p>
            </div>

            <div className="relative mt-10 flex items-end justify-between gap-3 border-t border-white/20 pt-5">
              <div>
                <p className="text-4xl font-black">2014</p>
                <p className="mt-1 text-sm text-green-50/80">
                  Where our journey began
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-green-50">
                <HeartHandshake size={19} />
                Built on trust
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:-left-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-800">
              <CheckCircle2 size={24} />
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-900">
                Trust comes first
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                Our promise to every customer
              </span>
            </span>
          </div>
        </motion.div>
      </div>

      <div className="relative flex justify-center pb-8 text-slate-400">
        <ArrowDown size={20} />
      </div>
    </section>
  );
}

// --------------------------------------------------
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

function JourneySection() {
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
            className="absolute left-[4.75] top-8 w-[3px] origin-top rounded-full bg-gradient-to-b from-green-400 via-[#2E7D32] to-amber-400 sm:left-1/2 sm:-translate-x-1/2"
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
                      <span className="text-3xl font-black text-[#2E7D32]">
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
                      <span className="text-2xl font-black text-[#2E7D32]">
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

function OfferingsSection() {
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
                  <span className="absolute right-4 top-4 rounded-full bg-[#EF6C00]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#C45100]">
                    New &amp; Tested Used
                  </span>
                )}

                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 ${
                    item.hardware
                      ? "bg-orange-50 text-[#EF6C00]"
                      : "bg-green-50 text-[#2E7D32]"
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
            className="inline-flex items-center gap-2 font-bold text-[#2E7D32] transition hover:gap-3"
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

function TrustSection() {
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
                        ? "bg-orange-50 text-[#EF6C00]"
                        : "bg-green-50 text-[#2E7D32]"
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
// FOUNDER'S PLEDGE
// --------------------------------------------------

function FounderSection() {
  return (
    <section className="relative overflow-hidden bg-[#183d3d] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full border border-white/10" />

      <div className="relative mx-auto max-w-5xl">
        <div className="grid items-center gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-white lg:mx-0">
              <HeartHandshake size={46} strokeWidth={1.3} />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-green-200">
              A personal promise
            </p>

            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              The Owner's Pledge
            </h2>

            <p className="mt-4 text-green-50/75">
              A local business is built one relationship at a time.
            </p>
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-sm sm:p-10"
          >
            <Quote
              size={52}
              className="mb-5 text-[#EF6C00]"
              fill="currentColor"
              strokeWidth={1}
            />

            <p className="text-xl font-medium leading-9 text-white sm:text-2xl sm:leading-10">
              "Moving forward with Trust. When you purchase from DVC, you
              aren't just choosing a product—you are choosing a local
              business that values its community. Every product we pack
              and every component we test should reflect our commitment
              to honest service."
            </p>

            <footer className="mt-8 border-t border-white/15 pt-6">
              <p className="text-lg font-bold text-white">
                {BRAND.owner}
              </p>
              <p className="mt-1 text-sm text-green-100/75">
                Founder &amp; Owner, Dhanuka Video &amp; Communication
              </p>

              <div className="mt-5 inline-flex max-w-full items-start gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-green-50">
                <MapPin size={17} className="mt-0.5 shrink-0" />
                <span>{BRAND.address}</span>
              </div>
            </footer>
          </motion.blockquote>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------
// FAQ ACCORDION
// --------------------------------------------------

const faqs = [
  {
    question: "How does Reserve & Pay In-Store work?",
    answer:
      "If the reservation feature is enabled for an item, follow the instructions on its product page or checkout. The shop should confirm availability, the hold deadline, and the accepted in-store payment methods before your reservation is considered confirmed.",
  },
  {
    question: "How are used computer parts tested?",
    answer:
      "Testing depends on the component. It can include visual inspection, compatibility checks, diagnostic tools, and functional tests under appropriate conditions. The actual checks and any known limitations should be stated in each product listing.",
  },
  {
    question: "Which payment methods can I use?",
    answer:
      "Available payment methods depend on the checkout options enabled by DVC. PayHere and eligible cash-on-pickup or cash-on-delivery options can be displayed here once the store's payment policies are confirmed.",
  },
  {
    question: "How much does delivery cost?",
    answer:
      "Applicable delivery charges and delivery conditions should be shown before you confirm your order. Check the checkout page for the rate that applies to your destination and order.",
  },
  {
    question: "Can I visit the physical store?",
    answer:
      "Yes. DVC is located at No. 8 Dambulla Road, Palapathwela, Matale 21070, Sri Lanka. Please check the store's current opening hours before visiting.",
  },
];

function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="bg-[#f8fafc] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-green-800">
            <MessageCircle size={15} />
            Good to know
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Questions? Let's make things clear.
          </h2>

          <p className="mt-4 max-w-md leading-7 text-slate-600">
            Shopping should feel straightforward. Here are answers to
            common questions about reservations, product condition, and
            ordering from DVC.
          </p>

          <Link
            to="/ContactUs"
            className="mt-7 inline-flex items-center gap-2 font-bold text-[#2E7D32] hover:gap-3"
          >
            Contact our team
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <div
                key={faq.question}
                className={`overflow-hidden rounded-2xl border bg-white transition-colors ${
                  isOpen ? "border-green-200" : "border-slate-200"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setActiveIndex(isOpen ? -1 : index)
                  }
                  className="flex min-h-16 w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-bold leading-6 text-slate-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-green-800 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-7 text-slate-600">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------
// STORE DETAILS
// --------------------------------------------------

function StoreDetailsSection() {
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2E7D32] px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
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
// FINAL CALL TO ACTION
// --------------------------------------------------

function FinalCTA() {
  return (
    <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-linear-to-br from-[#183d3d] via-[#245b43] to-dvcGreen px-6 py-12 text-center shadow-xl sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full border border-white/10" />

        <div className="relative mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white">
            <HeartHandshake size={17} />
            Moving forward with Trust
          </span>

          <h2 className="mt-6 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
            Your next great find starts here.
          </h2>

          <p className="mt-4 leading-7 text-green-50/85">
            Explore our collection of technology, accessories, and
            everyday essentials—backed by the values of a local business.
          </p>

          <Link
            to="/Shop"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-[#183d3d] transition hover:-translate-y-0.5 hover:bg-green-50"
          >
            Explore DVC Store
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------
// ABOUT PAGE
// --------------------------------------------------

export default function About() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white font-sans text-slate-800">
      <HeroSection />
      <JourneySection />
      <OfferingsSection />
      <TrustSection />
      <FounderSection />
      <FAQSection />
      <StoreDetailsSection />
      <FinalCTA />
    </main>
  );
}
