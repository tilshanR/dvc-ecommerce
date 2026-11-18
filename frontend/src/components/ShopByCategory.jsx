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

// Determines bento span layout
const getBentoSpan = (index, totalLength) => {
  const baseClass = "md:col-span-1 md:row-span-1";
  if (totalLength === 4) {
    if (index === 0) return "md:col-span-2 md:row-span-2";
    if (index === 3) return "md:col-span-2 md:row-span-1";
    return baseClass;
  }
  if (totalLength === 5) {
    if (index === 0) return "md:col-span-2 md:row-span-2";
    return baseClass;
  }
  if (totalLength === 7) {
    if (index === 0) return "md:col-span-2 md:row-span-2";
    if (index === 5 || index === 6) return "md:col-span-2 md:row-span-1";
    return baseClass;
  }
  const patternIndex = index % 5;
  if (patternIndex === 0) return "md:col-span-2 md:row-span-2";
  if (patternIndex === 1 || patternIndex === 2)
    return "md:col-span-1 md:row-span-1";
  if (patternIndex === 3 || patternIndex === 4)
    return "md:col-span-2 md:row-span-1";
  return baseClass;
};

const optimizeCloudinaryUrl = (url, isHero) => {
  if (!url) return "";
  if (url.includes("res.cloudinary.com")) {
    const width = isHero ? "w_1200" : "w_600";
    // Save the new URL to the variable first
    const optimizedUrl = url.replace(
      "/upload/",
      `/upload/f_auto,q_auto,${width}/`,
    );

    //  Now you can safely log it
    console.log("Original:", url, "Optimized:", optimizedUrl);

    //  Return the saved variable
    return optimizedUrl;
  }
  return url;
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#143630]">
            Find What You Need
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Shop by Category
          </h2>
        </motion.div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-60 grid-flow-dense gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`animate-pulse overflow-hidden rounded-2xl bg-gray-200 shadow-sm ${getBentoSpan(index, 4)}`}
              />
            ))}
          </div>
        )}

        {!isLoading && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-60 grid-flow-dense gap-4 sm:gap-6">
            {categories.map((category, index) => {
              const rawImageUrl =
                category.image ||
                categoryImages[category.slug] ||
                categoryImages.default;

              const isHero = index % 5 === 0;
              const optimizedImage = optimizeCloudinaryUrl(rawImageUrl, isHero);
              const spanClasses = getBentoSpan(index, categories.length);

              return (
                <motion.a
                  key={category._id || category.id}
                  href={`/shop?category=${category.slug}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.4,
                    delay: (index % 5) * 0.05,
                    ease: "easeOut",
                  }}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl bg-black shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 ${spanClasses}`}
                  style={{ transform: "translateZ(0)" }}
                >
                  <img
                    src={optimizedImage}
                    alt={category.name}
                    loading={isHero ? "eager" : "lazy"}
                    fetchPriority={isHero ? "high" : "auto"}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
                  />

                  <div className="absolute inset-x-0 bottom-0 z-5 h-1/2 bg-linear-to-t from-black/80 to-transparent opacity-70" />

                  <div
                    className="absolute inset-x-0 bottom-0 z-10 h-[55%] origin-bottom transition-all duration-700 ease-out group-hover:h-[65%] transform-gpu backface-hidden"
                    style={{
                      backdropFilter:
                        "blur(12px) brightness(0.5) saturate(1.1)",
                      WebkitBackdropFilter:
                        "blur(12px) brightness(0.5) saturate(1.1)",
                      WebkitMaskImage:
                        "linear-gradient(to top, rgba(0,0,0,1) 15%, rgba(0,0,0,0.8) 45%, rgba(0,0,0,0) 100%)",
                      maskImage:
                        "linear-gradient(to top, rgba(0,0,0,1) 15%, rgba(0,0,0,0.8) 45%, rgba(0,0,0,0) 100%)",
                      willChange: "transform, height",
                    }}
                  />

                  <div className="relative z-20 mt-auto flex w-full flex-col p-6">
                    <h3 className="text-xl font-bold leading-snug text-white drop-shadow-md sm:text-2xl">
                      {category.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-2 overflow-hidden">
                      <span className="text-sm font-semibold text-white/80 transition-colors duration-300 group-hover:text-white">
                        Explore
                      </span>
                      <motion.span
                        className="text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        initial={{ x: -10 }}
                        whileHover={{ x: 4 }}
                        animate={{ x: 0 }}
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
