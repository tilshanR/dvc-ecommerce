
import { motion } from "motion/react";

const brands = [
  { id: 1, name: "Samsung", logo: "/images/brands/samsung.png" },
  { id: 2, name: "Apple", logo: "/images/brands/apple.png" },
  { id: 3, name: "Nokia", logo: "/images/brands/nokia.png" },
  { id: 4, name: "Xiaomi", logo: "/images/brands/xiaomi.png" },
  { id: 5, name: "Anker", logo: "/images/brands/anker.png" },
  { id: 6, name: "Baseus", logo: "/images/brands/baseus.png" },
  { id: 7, name: "Logitech", logo: "/images/brands/logitech.png" },
  { id: 8, name: "Intel", logo: "/images/brands/intel.png" },
  { id: 9, name: "AMD", logo: "/images/brands/amd.png" },
  { id: 10, name: "ASUS", logo: "/images/brands/asus.png" },
  { id: 11, name: "Kingston", logo: "/images/brands/kingston.png" },
  { id: 12, name: "SanDisk", logo: "/images/brands/sandisk.png" },
];

const Brands = () => {
  return (
    <section
      aria-labelledby="brands-heading"
      className="bg-gray-50 px-5 py-12 sm:px-8 md:py-16"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-dvcGreen">
            Brands at DVC Store
          </p>

          <h2
            id="brands-heading"
            className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
          >
            Shop Your Favourite Brands
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
            Explore brands across mobile phones, computer hardware,
            accessories, and more.
          </p>
        </motion.div>

        {/* Brand logo grid */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className="flex h-20 items-center justify-center rounded-lg border border-gray-200 bg-white p-3 transition-colors duration-200 hover:border-gray-300 sm:h-24 sm:p-4"
              aria-label={brand.name}
            >
              <img
                src={brand.logo}
                alt={brand.name}
                loading="lazy"
                className="max-h-full max-w-full object-contain"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brands;
