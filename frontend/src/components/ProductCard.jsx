import { motion } from "motion/react";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const formatPrice = (price) => {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const getStockStatus = (stockValue) => {
  const stock = Number(stockValue);

  if (!Number.isFinite(stock) || stock < 0) {
    return {
      text: "Stock unavailable",
      className: "text-gray-500",
      canAddToCart: false,
    };
  }

  if (stock === 0) {
    return {
      text: "Out of stock (0)",
      className: "text-red-700",
      canAddToCart: false,
    };
  }

  if (stock < 10) {
    return {
      text: `${stock} in stock`,
      className: "text-amber-700",
      canAddToCart: true,
    };
  }

  return {
    text: `${stock} in stock`,
    className: "text-green-700",
    canAddToCart: true,
  };
};

const ProductCard = ({ product, onAddToCart, index = 0 }) => {
  if (!product) return null;

  const productId = product._id ?? product.id;
  const productName = product.name ?? "Unnamed product";

  const productUrl = productId
    ? `/products/${encodeURIComponent(productId)}`
    : product.slug
      ? `/products/${encodeURIComponent(product.slug)}`
      : "/products";

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  const categorySlug =
    product.categorySlug ??
    (typeof product.category === "object" ? product.category?.slug : "");

  const isComputerHardware = [
    "computer-hardware",
    "computer-pc-hardware",
    "computer-hardware-accessories",
  ].includes(categorySlug);

  const stockStatus = getStockStatus(product.availableStock);
  const isUsed = product.condition === "used";

  const showCondition =
    isComputerHardware && ["new", "used"].includes(product.condition);

  const handleAddToCart = () => {
    if (!stockStatus.canAddToCart || typeof onAddToCart !== "function") {
      return;
    }

    onAddToCart(product);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index, 5) * 0.06,
      }}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-dvcGreen hover:shadow-lg"
    >
      {/* Product image */}
      <Link
        to={productUrl}
        aria-label={`View ${productName}`}
        className="block overflow-hidden bg-gray-100"
      >
        <div className="aspect-square">
          <img
            src={product.image || "/images/product-placeholder.png"}
            alt={productName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      {/* Product information */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="mb-2 line-clamp-1 text-xs font-medium text-gray-500">
          {categoryName || "Uncategorized"}
        </p>

        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-gray-900 sm:text-base">
          <Link
            to={productUrl}
            className="rounded-sm outline-offset-2 hover:text-dvcGreen focus-visible:outline-2 focus-visible:outline-dvcGreen"
          >
            {productName}
          </Link>
        </h3>

        <p className="mt-3 text-base font-bold text-gray-900 sm:text-lg">
          {formatPrice(product.price)}
        </p>

        {/* Neutral condition badge for computer hardware only */}
        <div className="mt-2 min-h-6">
          {showCondition && (
            <span className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
              {isUsed ? "Used - Tested" : "Brand New"}
            </span>
          )}
        </div>

        {/* Exact available stock */}
        <p className={`mt-2 text-xs font-medium ${stockStatus.className}`}>
          {stockStatus.text}
        </p>

        {/* Actions stay aligned at the bottom */}
        <div className="mt-auto grid grid-cols-1 gap-2 pt-4">
          <Link
            to={productUrl}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-dvcGreen px-3 py-2 text-sm font-semibold text-dvcGreen transition-colors hover:bg-dvcGreen hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dvcGreen"
          >
            View Product
            <span aria-hidden="true">→</span>
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              !stockStatus.canAddToCart || typeof onAddToCart !== "function"
            }
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-dvcGreen px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dvcGreen disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
          >
            <ShoppingCart size={18} strokeWidth={2} aria-hidden="true" />
            {!stockStatus.canAddToCart
              ? stockStatus.text === "Stock unavailable"
                ? "Stock Unavailable"
                : "Out of Stock"
              : typeof onAddToCart === "function"
                ? "Add to Cart"
                : "Cart Coming Soon"}
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
