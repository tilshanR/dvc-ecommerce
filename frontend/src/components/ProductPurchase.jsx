import { Minus, Plus, ShoppingCart } from "lucide-react";

export default function ProductPurchase({
  stock,
  quantity,
  onDecrease,
  onIncrease,
  onAddToCart,
  cartLoading,
  cartMessage,
  cartError,
}) {
  return (
    <>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="flex h-12 items-center rounded-md border border-gray-300">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || cartLoading}
            onClick={onDecrease}
            className="px-3 py-3 text-gray-600 hover:text-[#183d3d] disabled:opacity-30"
          >
            <Minus size={16} />
          </button>
          <span className="min-w-8 text-center font-semibold">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={quantity >= stock || cartLoading || stock < 1}
            onClick={onIncrease}
            className="px-3 py-3 text-gray-600 hover:text-[#183d3d] disabled:opacity-30"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={stock < 1 || cartLoading}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#183d3d] px-5 font-semibold text-white transition hover:bg-[#245454] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart size={19} />
          {cartLoading ? "Adding..." : stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>

      {cartMessage && (
        <p role="status" className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-800">
          {cartMessage}
        </p>
      )}
      {cartError && (
        <p role="alert" className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {cartError}
        </p>
      )}
    </>
  );
}
