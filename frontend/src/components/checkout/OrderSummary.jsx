import { Package } from "lucide-react";
import { formatLKR } from "../../utils/checkoutUtils";

export default function OrderSummary({ cartItems, subtotal, shippingCost, total, isDelivery, selectedOption }) {
  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 lg:sticky lg:top-6">
      <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
      <p className="mt-1 text-sm text-gray-500">
        {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your order
      </p>

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
              <h3 className="line-clamp-2 font-semibold text-gray-900">{item.name}</h3>
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
          <span className="font-medium text-gray-900">{formatLKR(subtotal)}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-gray-600">
            {isDelivery ? "Home Delivery" : "Store Pickup"}
          </span>
          <span className="font-medium text-gray-900">
            {Number(shippingCost) === 0 ? "Free" : formatLKR(shippingCost)}
          </span>
        </div>

        <div className="flex justify-between gap-4 border-t border-gray-100 pt-4 text-base">
          <span className="font-bold text-gray-900">Total</span>
          <span className="text-xl font-bold text-[#183D3D]">{formatLKR(total)}</span>
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