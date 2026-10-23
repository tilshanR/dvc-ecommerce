import { motion } from "motion/react";

const categories = [
  {
    id: 1,
    title: "Mobile Phones",
    description:
      "Discover smartphones and feature phones for your everyday communication needs.",
    image: "/images/categories/mobile-phones.jpg",
    link: "/shop?category=mobile-phones",
    imageAlt: "Mobile phones",
  },
  {
    id: 2,
    title: "Mobile Accessories",
    description:
      "Find phone covers, batteries, chargers, USB cables, power banks, and tempered glass.",
    image: "/images/categories/mobile-accessories.jpg",
    link: "/shop?category=mobile-accessories",
    imageAlt: "Mobile phone accessories",
  },
  {
    id: 3,
    title: "Computer & PC Hardware",
    description:
      "Explore computer peripherals, PC components, storage devices, and cables.",
    image: "/images/categories/computer-hardware.jpg",
    link: "/shop?category=computer-hardware",
    imageAlt: "Computer components and accessories",
  },
  {
    id: 4,
    title: "Stationery & Office Supplies",
    description:
      "Get pens, pencils, exercise books, CR books, and everyday stationery essentials.",
    image: "/images/categories/stationery.jpg",
    link: "/shop?category=stationery",
    imageAlt: "Stationery and office supplies",
  },
];

const ShopByCategory = () => {
  return (
    <section
      aria-labelledby="shop-by-category-heading"
      className="bg-gray-50 px-5 py-16 sm:px-8 md:py-20"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="mb-10 text-center sm:mb-12"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-dvcGreen">
            Find What You Need
          </p>

          <h2
            id="shop-by-category-heading"
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            Shop by Category
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            From mobile phones and computer hardware to everyday stationery,
            explore the products you need at DVC Store.
          </p>
        </motion.div>

        {/* Category cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <motion.a
              key={category.id}
              href={category.link}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.4,
                delay: index * 0.08,
              }}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-dvcGreen hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dvcGreen"
            >
              {/* Category image */}
              <div className="aspect-4/3 overflow-hidden bg-gray-100">
                <img
                  src={category.image}
                  alt={category.imageAlt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Category details */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold leading-snug text-gray-900 transition-colors duration-200 group-hover:text-dvcGreen">
                  {category.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
                  {category.description}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-dvcGreen">
                  Explore Category
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
