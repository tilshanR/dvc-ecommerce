import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, BadgeCheck, Banknote, CheckCircle2, HeartHandshake, MapPin, ShieldCheck, ShoppingBag, Store } from "lucide-react";

// HERO: FLIP WORDS-INSPIRED ANIMATION
// --------------------------------------------------

export default function HeroSection() {
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
            <span className="mt-2 block text-dvcGreen">
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
              href="https://www.google.com/maps/place/Danuka+Video+%26+Communication/data=!4m2!3m1!1s0x0:0xd5510de57d99045c?sa=X&ved=1t:2428&ictx=111"
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
