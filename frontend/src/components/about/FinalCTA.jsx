import { Link } from "react-router-dom";
import { ArrowRight, HeartHandshake } from "lucide-react";

// FINAL CALL TO ACTION
// --------------------------------------------------

export default function FinalCTA() {
  return (
    <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[4xl] bg-linear-to-br from-[#183d3d] via-[#245b43] to-dvcGreen px-6 py-12 text-center shadow-xl sm:px-12 sm:py-16">
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
