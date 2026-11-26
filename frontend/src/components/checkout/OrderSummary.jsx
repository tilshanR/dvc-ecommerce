import { Package, Scale, Truck } from "lucide-react";
import { formatLKR, formatWeightGrams } from "../../utils/checkoutUtils";

export default function OrderSummary({
  cartItems,
  subtotal,
  shippingCost,
  total,
  isDelivery,
  selectedOption,
  quote = null,
  isQuoting = false,
  shippingSettings = null,
}) {
  const displaySubtotal = quote?.subtotal ?? subtotal;
  const freeThreshold = Number(
    quote?.freeShippingThreshold ??
      shippingSettings?.freeShippingThreshold ??
      0,
  );
  const showFreeShippingBar = isDelivery && freeThreshold > 0;
  const amountRemaining = Math.max(0, freeThreshold - displaySubtotal);
  const freeProgressPct =
    freeThreshold > 0
      ? Math.min(100, Math.round((displaySubtotal / freeThreshold) * 100))
      : 0;
  const qualifiesFreeShipping =
    showFreeShippingBar &&
    (Boolean(quote?.freeShippingApplied) || amountRemaining === 0);

  const resolvedShippingCost = (() => {
    if (!isDelivery) return 0;
    if (qualifiesFreeShipping) return 0;
    if (quote && typeof quote.shippingCost === "number") {
      return quote.shippingCost;
    }
    if (quote && quote.requiresDistrict) return null;
    return shippingCost;
  })();

  const displayTotal =
    resolvedShippingCost !== null
      ? displaySubtotal + resolvedShippingCost
      : displaySubtotal;

  const formattedWeight = formatWeightGrams(quote?.totalWeightGrams);

  const shippingTierLabel = (() => {
    if (!isDelivery) return "Store Pickup";
    if (quote?.tier === "free" || qualifiesFreeShipping) {
      return "Home Delivery (Free)";
    }
    if (quote?.tier === "local") {
      return `Local Delivery (${quote.district})`;
    }
    if (quote?.tier === "islandwide") {
      return `Islandwide Delivery (${quote.district})`;
    }
    return "Home Delivery";
  })();

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 lg:sticky lg:top-6">
      <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
      <p className="mt-1 text-sm text-gray-500">
        {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your
        order
      </p>

      {/* Conditional Free Shipping Progress Bar (hidden when threshold is 0) */}
      {showFreeShippingBar && (
        <div
          className={`mt-4 rounded-xl border p-3 text-xs ${
            qualifiesFreeShipping
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-[#b9d0cd] bg-[#e8f0ef]/60 text-[#183d3d]"
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            <Truck size={14} className="shrink-0" />
            {qualifiesFreeShipping ? (
              <span>Free islandwide delivery applied!</span>
            ) : (
              <span>
                Add {formatLKR(amountRemaining)} more for free delivery
              </span>
            )}
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/80">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                qualifiesFreeShipping ? "bg-emerald-600" : "bg-[#183d3d]"
              }`}
              style={{ width: `${freeProgressPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 space-y-5">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-4">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="h-20 w-20 rounded-lg border border-gray-100 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                <Package size={28} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 font-semibold text-gray-900">
                {item.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
              <p className="mt-2 font-semibold text-[#183D3D]">
                {formatLKR(Number(item.price) * Number(item.quantity))}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">
            {formatLKR(displaySubtotal)}
          </span>
        </div>

        {isDelivery && formattedWeight && (
          <div className="flex justify-between gap-4 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Scale size={13} />
              Total Parcel Weight
            </span>
            <span>
              {formattedWeight}
              {quote?.chargeableExtraKg > 0
                ? ` (+${quote.chargeableExtraKg} extra kg)`
                : ""}
            </span>
          </div>
        )}

        <div className="flex justify-between gap-4">
          <span className="text-gray-600">{shippingTierLabel}</span>
          <span className="font-medium text-gray-900">
            {isQuoting ? (
              <span className="text-gray-400">Calculating...</span>
            ) : resolvedShippingCost === null ? (
              <span className="text-amber-700">Select district</span>
            ) : Number(resolvedShippingCost) === 0 ? (
              <span className="text-emerald-700">Free</span>
            ) : (
              formatLKR(resolvedShippingCost)
            )}
          </span>
        </div>

        <div className="flex justify-between gap-4 border-t border-gray-100 pt-4 text-base">
          <span className="font-bold text-gray-900">
            {resolvedShippingCost === null ? "Subtotal" : "Total"}
          </span>
          <span className="text-xl font-bold text-[#183D3D]">
            {formatLKR(displayTotal)}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-gray-50 p-4 text-sm">
        <p className="font-semibold text-gray-800">Selected option</p>
        <p className="mt-1 text-gray-600">
          {selectedOption.title} · {selectedOption.payment}
        </p>
      </div>
    </aside>
  );
}