import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getShopCategories } from "../services/categoryApi";

const categoryImages = {
  "mobile-phones": "/images/categories/mobile-phones.jpg",
  "mobile-accessories": "/images/categories/mobile-accessories.jpg",
  "computer-hardware": "/images/categories/computer-hardware.jpg",
  stationery: "/images/categories/stationery.jpg",
  default: "/images/categories/default-placeholder.jpg",
};

const ShopByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        const data = await getShopCategories({ signal: controller.signal });
        setCategories(data);
      } catch (err) {
        if (err.name !== "AbortError" && err.name !== "CanceledError") {
          console.error("Failed to load categories", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
    return () => controller.abort();
  }, []);

  return (
    <section className="bg-gray-50 px-5 py-16 sm:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-dvcGreen">
            Find What You Need
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Shop by Category
          </h2>
        </motion.div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="aspect-4/3 w-full bg-gray-200" />
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 h-5 w-3/4 rounded-md bg-gray-200" />
                  <div className="mb-2 h-4 w-full rounded-md bg-gray-100" />
                  <div className="mb-6 h-4 w-5/6 rounded-md bg-gray-100" />
                  <div className="mt-auto h-4 w-1/3 rounded-md bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category Grid */}
        {!isLoading && categories.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => {
              const imageUrl =
                categoryImages[category.slug] || categoryImages.default;

              return (
                <motion.a
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-500 hover:-translate-y-2 hover:border-dvcGreen/40 hover:shadow-2xl hover:shadow-dvcGreen/10"
                >
                  {/* Image Container with subtle gradient overlay */}
                  <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
                    <div className="absolute inset-0 z-10 bg-linear-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <img
                      src={imageUrl}
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  </div>

                  {/* Content Container */}
                  <div className="flex flex-1 flex-col p-6 relative z-20 bg-white">
                    <h3 className="text-xl font-bold leading-snug text-gray-900 transition-colors duration-300 group-hover:text-dvcGreen">
                      {category.name}
                    </h3>

                    <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-500 transition-colors duration-300 group-hover:text-gray-700">
                      {category.description ||
                        "Explore products in this category."}
                    </p>

                    {/* Animated Arrow Link */}
                    <div className="mt-6 flex items-center gap-2 overflow-hidden">
                      <span className="text-sm font-bold text-dvcGreen">
                        Explore Category
                      </span>
                      <motion.span
                        className="text-dvcGreen"
                        initial={{ x: 0 }}
                        whileHover={{ x: 4 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        →
                      </motion.span>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopByCategory;
