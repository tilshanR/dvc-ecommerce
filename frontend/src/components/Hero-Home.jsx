import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Upgraded to React Router
import { getProducts } from "../services/productApi"; // Adjust this path to wherever your API file is located

const HeroHome = () => {
  const heading = ["Discover", "Your", "Next", "Favorite"];
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const rotationDuration = 70;

  useEffect(() => {
    //an AbortController to cancel the fetch if the component unmounts early
    const abortController = new AbortController();

    const fetchHeroProducts = async () => {
      try {
        // Fetch the 14 newest products using your existing API setup
        const data = await getProducts(
          { limit: 14, sortBy: "createdAt", sortOrder: "desc" },
          { signal: abortController.signal },
        );

        setProducts(data.products || []);
      } catch (error) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          console.error("Failed to fetch hero products:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroProducts();

    return () => {
      abortController.abort(); // Cleanup fetch on unmount
    };
  }, []);

  return (
    <section className="relative flex min-h-187.5 w-full items-center justify-center overflow-hidden bg-white px-4 py-20 sm:min-h-212.5 lg:min-h-275">
      {/* The Water Wheel Track */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{
            duration: rotationDuration,
            repeat: Infinity,
            ease: "linear",
          }}
          className="relative flex h-full w-full items-center justify-center"
        >
          {!isLoading &&
            products.map((product, index) => {
              // Automatically adapts if have fewer than 14 products
              const angle = (360 / products.length) * index;

              // Handle Cloudinary URL whether it's stored as a string or an array of objects
              const imageUrl =
                product.image ||
                product.images?.[0]?.url ||
                product.images?.[0] ||
                "";

              return (
                <div
                  key={product._id}
                  className="absolute pointer-events-auto"
                  style={{
                    transform: `rotate(${angle}deg) translateY(calc(-1 * clamp(260px, 42vw, 460px)))`,
                  }}
                >
                  <motion.div
                    animate={{
                      rotate: [-angle, -angle - 360],
                    }}
                    transition={{
                      duration: rotationDuration,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Link
                      to={`/products/${product._id}`}
                      className="block h-24 w-16 overflow-hidden rounded-xl shadow-md transition-transform duration-300 hover:scale-110 hover:shadow-2xl sm:h-32 sm:w-24 md:h-40 md:w-32 lg:h-48 lg:w-36"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-500">
                          No Image
                        </div>
                      )}
                    </Link>
                  </motion.div>
                </div>
              );
            })}
        </motion.div>
      </div>

      {/* Radial Mask overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_25%,rgba(255,255,255,0.6)_45%,transparent_70%)] lg:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85)_20%,rgba(255,255,255,0)_60%)]" />

      {/* Central Hero Text */}
      <div className="relative z-20 mx-auto w-full max-w-4xl text-center pointer-events-none">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-dvcGreen"
        >
          Welcome to DVC Store
        </motion.p>

        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
          {heading.map((word, index) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
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

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg"
        >
          Discover quality products across all our categories, explore the
          latest arrivals, and find your favorites at DVC Store.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="mt-9 flex flex-col items-center justify-center gap-4 pointer-events-auto sm:flex-row"
        >
          <Link
            to="/#new-arrivals"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-dvcGreen px-8 py-3 font-semibold text-white transition-colors duration-200 hover:bg-green-800 sm:w-auto"
          >
            New Arrivals
          </Link>
          <Link
            to="/shop"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-gray-100 px-8 py-3 font-semibold text-gray-900 transition-colors duration-200 hover:bg-gray-200 sm:w-auto"
          >
            Shop Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroHome;
