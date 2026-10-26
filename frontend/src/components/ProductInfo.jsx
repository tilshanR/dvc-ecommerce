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
  const hasOffer =
    product.originalPrice !== null &&
    Number.isFinite(product.originalPrice) &&
    product.originalPrice > product.price &&
    product.price >= 0;

  const discountAmount = hasOffer ? product.originalPrice - product.price : 0;
  const discountPercentage = hasOffer
    ? Math.round((discountAmount / product.originalPrice) * 100)
    : 0;

  return (
    <div className="flex flex-col">
      <p className="text-sm font-semibold uppercase tracking-wider text-[#477b70]">
        {product.brand}
      </p>
      <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
        {product.name}
      </h1>

      {product.rating > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1 text-amber-500" aria-label={`Rating: ${product.rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={15} className={star <= Math.round(product.rating) ? "fill-current" : ""} />
            ))}
            <span className="ml-1 text-gray-600">({product.reviewCount} reviews)</span>
          </div>
        </div>
      )}

      {product.sku && <p className="mt-2 text-sm text-gray-500">SKU: {product.sku}</p>}
      <div className="my-5 border-t border-gray-100" />

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
            You pay {formatPrice(product.price)} instead of {formatPrice(product.originalPrice)}.
          </p>
        )}
      </div>

      <p className="mt-5 text-sm leading-7 text-gray-600">{product.description}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <span className="rounded-md border border-gray-200 px-3 py-2 text-sm">
          Condition: <strong className="capitalize">{product.condition}</strong>
        </span>
        {product.availableStock > 0 ? (
          <span className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            <Check size={16} />
            {product.availableStock} in stock
          </span>
        ) : (
          <span className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            Out of stock
          </span>
        )}
      </div>

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
