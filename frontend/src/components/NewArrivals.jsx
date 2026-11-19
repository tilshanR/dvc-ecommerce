import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import ProductCard from "./ProductCard";

import { getProducts } from "../services/productApi";

const resolveProductImage = (product) => {
  if (typeof product?.image === "string" && product.image) {
    return product.image;
  }
  if (typeof product?.image?.url === "string" && product.image.url) {
    return product.image.url;
  }
  if (
    typeof product?.image?.secure_url === "string" &&
    product.image.secure_url
  ) {
    return product.image.secure_url;
  }
  if (typeof product?.imageUrl === "string" && product.imageUrl) {
    return product.imageUrl;
  }

  const firstImage = Array.isArray(product?.images) ? product.images[0] : null;
  if (typeof firstImage === "string" && firstImage) {
    return firstImage;
  }
  if (typeof firstImage?.url === "string" && firstImage.url) {
    return firstImage.url;
  }
  if (typeof firstImage?.secure_url === "string" && firstImage.secure_url) {
    return firstImage.secure_url;
  }

  return "";
};

const ArrowButton = ({ direction, onClick, disabled }) => {
  const isLeft = direction === "left";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isLeft ? "Previous products" : "Next products"}
      className={`absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-md transition hover:border-dvcGreen hover:bg-dvcGreen hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dvcGreen disabled:pointer-events-none disabled:opacity-0 sm:h-11 sm:w-11 ${
        isLeft ? "left-1 sm:-left-5" : "right-1 sm:-right-5"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d={isLeft ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
};

const NewArrivals = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Carousel state
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        setError("");

        // Call backend using the helper
        const data = await getProducts(
          {
            sortBy: "createdAt", // Sorts by newest
            sortOrder: "desc",
            limit: 8, // Limits to 8 items
          },
          { signal: controller.signal },
        );

        const rawProducts = Array.isArray(data) ? data : data?.products || [];
        const normalizedProducts = rawProducts.map((product) => ({
          ...product,
          image: resolveProductImage(product),
        }));

        setProducts(normalizedProducts);
      } catch (err) {
        // Ignore aborted requests caused by the component unmounting
        if (err.name !== "AbortError" && err.name !== "CanceledError") {
          setError("We couldn't load the latest products. Please try again.");
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

  // Work out whether each arrow should be enabled
  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [products, loading, updateArrows]);

  const scrollByPage = (direction) => {
    const el = trackRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction * el.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="new-arrivals"
      aria-labelledby="new-arrivals-heading"
      className="bg-white px-5 py-16 sm:px-8 md:py-20 scroll-mt-20"
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
                Explore the latest products added to DVC Store, from electronics
                and computer hardware to everyday stationery.
              </p>
            </div>

            <a
              href="/shop?sortBy=createdAt&sortOrder=desc"
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

        {/* Carousel */}
        {!loading && !error && products.length > 0 && (
          <div
            className="relative"
            role="region"
            aria-roledescription="carousel"
            aria-label="New arrivals"
          >
            <ArrowButton
              direction="left"
              onClick={() => scrollByPage(-1)}
              disabled={!canScrollLeft}
            />
            <ArrowButton
              direction="right"
              onClick={() => scrollByPage(1)}
              disabled={!canScrollRight}
            />

            <div
              ref={trackRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-1 sm:gap-6 [scrollbar-none] [&::-webkit-scrollbar]:hidden"
            >
              {products.map((product, index) => (
                <div
                  key={product._id ?? product.id}
                  className="w-[calc((100%-1rem)/2)] shrink-0 snap-start sm:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]"
                >
                  <ProductCard
                    product={product}
                    index={index}
                    onAddToCart={onAddToCart}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;