import { motion } from "framer-motion";
import { HeartHandshake, MapPin, Quote } from "lucide-react";
import { BRAND } from "./Brand";

// FOUNDER'S PLEDGE
// --------------------------------------------------

export default function FounderSection() {
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
              className="mb-5 text-dvcAmber"
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
