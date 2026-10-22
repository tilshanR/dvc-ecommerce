import { motion } from "motion/react";

const HeroHome = () => {
  const heading = ["Discover", "Your", "Next", "Favorite"];

  return (
    <section className="flex min-h-105 w-full items-center justify-center bg-gray-50 px-6 py-16 sm:min-h-120 md:min-h-130">
      <div className="mx-auto w-full max-w-4xl text-center">
        {/* Welcome text */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-dvcGreen"
        >
          Welcome to DVC Store
        </motion.p>

        {/* Main heading */}
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
          {heading.map((word, index) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
              }}
              className="mr-3 inline-block"
            >
              {word}
            </motion.span>
          ))}

          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-2 block text-dvcGreen"
          >
            at DVC Store
          </motion.span>
        </h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg"
        >
          Discover quality products, explore the latest arrivals, and find
          your favorites at DVC Store.
        </motion.p>

        {/* Shopping buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="/products?sort=newest"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-dvcGreen px-8 py-3 font-semibold text-white transition-colors duration-200 hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dvcGreen sm:w-auto"
          >
            New Arrivals
          </a>

          <a
            href="/shop"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-gray-200 px-8 py-3 font-semibold text-gray-900 transition-colors duration-200 hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 sm:w-auto"
          >
            Shop Now
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroHome;