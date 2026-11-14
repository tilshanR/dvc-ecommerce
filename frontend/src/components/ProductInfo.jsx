import { Check, Star } from "lucide-react";
import { formatPrice } from "../utils/productUtils";
import ProductPurchase from "./ProductPurchase";
import ProductBenefits from "./ProductBenefits";

export default function ProductInfo({
  product,
  quantity,
  onDecrease,
  onIncrease,
  onAddToCart,
  cartLoading,
  cartMessage,
  cartError,
}) {
  // Determine if the product has a valid discount offer
  const hasOffer =
    product.originalPrice !== null &&
    Number.isFinite(product.originalPrice) &&
    product.originalPrice > product.price &&
    product.price >= 0;

  // Calculate discount metrics if an offer exists
  const discountAmount = hasOffer ? product.originalPrice - product.price : 0;
  const discountPercentage = hasOffer
    ? Math.round((discountAmount / product.originalPrice) * 100)
    : 0;

  return (
    <div className="flex flex-col">
      {/* Brand and Title */}
      <p className="text-sm font-semibold uppercase tracking-wider text-[#477b70]">
        {product.brand}
      </p>
      <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
        {product.name}
      </h1>

      {/* Ratings - Only display if the product has a rating greater than 0 */}
      {product.rating > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <div
            className="flex items-center gap-1 text-amber-500"
            aria-label={`Rating: ${product.rating} out of 5`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={15}
                className={
                  star <= Math.round(product.rating) ? "fill-current" : ""
                }
              />
            ))}
            <span className="ml-1 text-gray-600">
              ({product.reviewCount} reviews)
            </span>
          </div>
        </div>
      )}

      {/* SKU and visual separator */}
      {product.sku && (
        <p className="mt-2 text-sm text-gray-500">SKU: {product.sku}</p>
      )}
      <div className="my-5 border-t border-gray-100" />

      {/* Pricing Section */}
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-3xl font-bold tracking-tight text-[#183d3d] sm:text-4xl">
            {formatPrice(product.price)}
          </span>
          {hasOffer && (
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Discount breakdown - Only renders if the product has a valid offer */}
        {hasOffer && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#183d3d] px-3 py-1.5 text-sm font-bold text-white">
              {discountPercentage}% OFF
            </span>
            <span className="rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-800">
              You save {formatPrice(discountAmount)}
            </span>
          </div>
        )}
        {hasOffer && (
          <p className="mt-2 text-xs text-gray-500">
            You pay {formatPrice(product.price)} instead of{" "}
            {formatPrice(product.originalPrice)}.
          </p>
        )}
      </div>

      {/* 
        Description section with UX improvements: 
        Uses break-words to prevent long unbroken strings from breaking layout.
        Uses line-clamp-3 to keep the initial view compact. 
      */}
      <div className="mt-5">
        <p className="line-clamp-3 break-words text-sm leading-7 text-gray-600">
          {product.description}
        </p>
        {/* Smooth scroll to full specifications if a description exists */}
        {product.description && (
          <button
            onClick={(e) => {
              e.preventDefault();
              const section = document.getElementById(
                "product-specifications-section",
              );
              if (section) {
                const offset =
                  section.getBoundingClientRect().top + window.scrollY - 40;
                window.scrollTo({ top: offset, behavior: "smooth" });
              }
            }}
            className="mt-1 text-sm font-semibold text-[#183d3d] transition-colors hover:text-[#245252] hover:underline"
          >
            See full details ↓
          </button>
        )}
      </div>

      {/* 
        Condition and Stock Status 
        Condition text is rendered without a border/padding to distinguish it from interactive elements. 
      */}
      {/* 
        UX FIX: Read-Only Metadata Bar
        Groups Condition and Stock into a flat, subtle banner without 
        individual borders, completely removing the "button" illusion.
      */}
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-gray-50 px-4 py-3 border border-gray-100">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-gray-500">Condition:</span>
          <span className="font-bold capitalize text-gray-900">
            {product.condition}
          </span>
        </div>

        {/* Vertical divider visible on desktop */}
        <div
          className="hidden h-4 w-px bg-gray-300 sm:block"
          aria-hidden="true"
        />

        {product.availableStock > 0 ? (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-green-700">
            <Check size={16} />
            {product.availableStock} in stock
          </div>
        ) : (
          <div className="text-sm font-semibold text-red-700">Out of stock</div>
        )}
      </div>

      {/* Cart and Purchasing components */}
      <ProductPurchase
        stock={product.availableStock}
        quantity={quantity}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        onAddToCart={onAddToCart}
        cartLoading={cartLoading}
        cartMessage={cartMessage}
        cartError={cartError}
      />
      <ProductBenefits warranty={product.warranty} />
    </div>
  );
}
