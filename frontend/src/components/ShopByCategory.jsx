import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getShopCategories } from "../services/categoryApi";
// 1. Create a fallback map for your local images based on the category slug
const categoryImages = {
  "mobile-phones": "/images/categories/mobile-phones.jpg",
  "mobile-accessories": "/images/categories/mobile-accessories.jpg",
  "computer-hardware": "/images/categories/computer-hardware.jpg",
  stationery: "/images/categories/stationery.jpg",
  default: "/images/categories/default-placeholder.jpg", // Create a generic placeholder image just in case
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
        // handle error
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
    return () => controller.abort();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className="bg-gray-50 px-5 py-16 sm:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => {
            // Get the mapped image or fallback to default
            const imageUrl =
              categoryImages[category.slug] || categoryImages.default;

            return (
              <motion.a
                key={category.id}
                href={`/shop?category=${category.slug}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-dvcGreen hover:shadow-lg"
              >
                <div className="aspect-4/3 overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold leading-snug text-gray-900 transition-colors duration-200 group-hover:text-dvcGreen">
                    {category.name}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
                    {category.description ||
                      "Explore products in this category."}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-dvcGreen">
                    Explore Category{" "}
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
