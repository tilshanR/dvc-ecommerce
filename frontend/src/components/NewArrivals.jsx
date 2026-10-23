
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import ProductCard from "./ProductCard";

const API_URL = "/api/products";

const NewArrivals = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}?sort=newest&limit=8`,
          { signal: controller.signal }
        );

        if (!response.ok) {
        //   throw new Error("Unable to load new arrivals.");
        //return dummy product array
           
        }

        const data = await response.json();
       
        // Supports either an array or { products: [...] }.
        const productList = Array.isArray(data)
          ? data
          : data.products;

        if (!Array.isArray(productList)) {
          throw new Error("The product data format is invalid.");
        }

        setProducts(productList);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            "We couldn't load the latest products. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchNewArrivals();

    return () => controller.abort();
  }, []);

  return (
    <section
      aria-labelledby="new-arrivals-heading"
      className="bg-white px-5 py-16 sm:px-8 md:py-20"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="mb-10 sm:mb-12"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-dvcGreen">
            Fresh to Our Store
          </p>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2
                id="new-arrivals-heading"
                className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              >
                New Arrivals
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                Explore the latest products added to DVC Store, from
                electronics and computer hardware to everyday stationery.
              </p>
            </div>

            <a
              href="/shop?sort=newest"
              className="inline-flex w-fit items-center gap-2 font-semibold text-dvcGreen transition-colors hover:text-green-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dvcGreen"
            >
              View All
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
            aria-label="Loading new arrivals"
            aria-busy="true"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <div className="aspect-square bg-gray-200" />

                <div className="space-y-3 p-4">
                  <div className="h-3 w-1/3 rounded bg-gray-200" />
                  <div className="h-4 w-4/5 rounded bg-gray-200" />
                  <div className="h-5 w-1/2 rounded bg-gray-200" />
                  <div className="h-3 w-2/5 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 font-semibold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-10 text-center text-gray-600">
            No new arrivals to display right now. Please check back soon.
          </p>
        )}

        {/* Reusable product cards */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product._id ?? product.id}
                product={product}
                index={index}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
