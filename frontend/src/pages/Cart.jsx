import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  Store,
  CreditCard,
  MapPin,
  PackageCheck,
  AlertCircle,
} from "lucide-react";

const formatPrice = (price) => `LKR ${Number(price).toLocaleString("en-LK")}`;

const checkoutOptions = [
  {
    id: "delivery-online",
    title: "Home Delivery",
    subtitle: "Pay online and get it delivered",
    detail: "Delivery fee: LKR 300",
    icon: Truck,
  },
  {
    id: "pickup-online",
    title: "Store Pickup",
    subtitle: "Pay online and collect your order",
    detail: "Free store pickup",
    icon: Store,
  },
  {
    id: "pickup-store",
    title: "Pay at Store",
    subtitle: "Reserve online and pay when collecting",
    detail: "Free store pickup",
    icon: CreditCard,
  },
];


export default function Cart() {
  const navigate = useNavigate();

  const { cartItems, updateQuantity, removeItem } = useCart();

  const [selectedCheckout, setSelectedCheckout] = useState("delivery-online");

  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );

  const totalQuantity = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const shippingCost =
    selectedCheckout === "delivery-online" && cartItems.length > 0 ? 300 : 0;

  const total = subtotal + shippingCost;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    navigate("/checkout", {
      state: {
        cartItems,
        subtotal,
        shippingCost,
        total,
        checkoutMethod: selectedCheckout,
      },
    });
  };

  const selectedOption = checkoutOptions.find(
    (option) => option.id === selectedCheckout,
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/shop" className="transition hover:text-[#183d3d]">
            Shop
          </Link>

          <ChevronRight size={15} />

          <span className="font-medium text-[#183d3d]">Shopping Cart</span>
        </div>

        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f0ef] text-[#183d3d]">
                <ShoppingBag size={24} />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#183d3d] sm:text-4xl">
                Your Cart
              </h1>
            </div>

            <p className="text-sm text-gray-500 sm:text-base">
              Review your items before placing your order.
            </p>
          </div>

          <div className="text-sm font-medium text-gray-500">
            {totalQuantity} {totalQuantity === 1 ? "item" : "items"} in your
            cart
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* Empty cart */
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f0ef] text-[#183d3d]">
              <ShoppingBag size={36} />
            </div>

            <h2 className="mb-2 text-2xl font-bold text-[#183d3d]">
              Your cart is empty
            </h2>

            <p className="mx-auto mb-7 max-w-md text-sm leading-6 text-gray-500">
              You haven't added any products yet. Explore our store and find
              something you like.
            </p>

            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#183d3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#245454] focus:outline-none focus:ring-2 focus:ring-[#183d3d] focus:ring-offset-2"
            >
              <ArrowLeft size={17} />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            {/* Cart items */}
            <div className="space-y-6 lg:col-span-2">
              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
                  <h2 className="font-bold text-[#183d3d]">Cart Items</h2>

                  <span className="rounded-full bg-[#e8f0ef] px-3 py-1 text-xs font-semibold text-[#183d3d]">
                    {cartItems.length} products
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => {
                    const isLowStock = item.stock <= 3;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6"
                      >
                        {/* Product image */}
                        <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 sm:h-28 sm:w-28">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-contain p-2"
                          />
                        </div>

                        {/* Product information */}
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#183d3d]">
                            {item.category}
                          </p>

                          <h3 className="text-base font-bold text-gray-900">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {item.description}
                          </p>

                          <p className="mt-3 text-base font-bold text-[#183d3d]">
                            {formatPrice(item.price)}
                          </p>

                          {isLowStock && (
                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                              <AlertCircle size={14} />
                              Only {item.stock} left in stock
                            </div>
                          )}
                        </div>

                        {/* Quantity and item total */}
                        <div className="flex flex-wrap items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                          <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                              aria-label={`Decrease quantity of ${item.name}`}
                              className="flex h-10 w-10 items-center justify-center rounded-l-xl text-gray-600 transition hover:bg-[#e8f0ef] hover:text-[#183d3d] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus size={15} />
                            </button>

                            <span className="min-w-10 text-center text-sm font-semibold text-gray-800">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={item.quantity >= item.stock}
                              aria-label={`Increase quantity of ${item.name}`}
                              className="flex h-10 w-10 items-center justify-center rounded-r-xl text-gray-600 transition hover:bg-[#e8f0ef] hover:text-[#183d3d] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-gray-500">Item total</p>

                            <p className="mt-1 font-bold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183d3d] focus-visible:ring-offset-2"
                          >
                            <Trash2 size={15} />
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 sm:px-6">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#183d3d] transition hover:text-[#245454]"
                  >
                    <ArrowLeft size={16} />
                    Continue Shopping
                  </Link>
                </div>
              </section>

              {/* Checkout method */}

              {/* Delivery & Payment */}
              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* Section heading */}
                <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-5 py-5 sm:px-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#183d3d] text-white">
                    <MapPin size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#183d3d]">
                      Delivery & Payment
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose how to receive and pay for your order.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  {/* Method selection heading */}
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Select a method
                  </p>

                  {/* Delivery options */}
                  <div className="space-y-3">
                    {checkoutOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = selectedCheckout === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setSelectedCheckout(option.id)}
                          className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183d3d] focus-visible:ring-offset-2 ${
                            isSelected
                              ? "border-[#183d3d] bg-[#e8f0ef] shadow-sm"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {/* Icon */}
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              isSelected
                                ? "bg-[#183d3d] text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <Icon size={21} />
                          </div>

                          {/* Option information */}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900">
                              {option.title}
                            </p>

                            <p className="mt-1 text-sm leading-5 text-gray-600">
                              {option.subtitle}
                            </p>

                            <p
                              className={`mt-2 text-sm font-semibold ${
                                isSelected ? "text-[#183d3d]" : "text-gray-500"
                              }`}
                            >
                              {option.detail}
                            </p>
                          </div>

                          {/* Selection indicator */}
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              isSelected
                                ? "border-[#183d3d] bg-[#183d3d]"
                                : "border-gray-300 bg-white"
                            }`}
                            aria-hidden="true"
                          >
                            {isSelected && (
                              <Check size={12} strokeWidth={3} color="white" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Separate explanation panel */}
                  <div
                    aria-live="polite"
                    className="rounded-xl border border-[#b9d0cd] bg-white"
                  >
                    <div className="flex items-center gap-2 border-b border-[#e8f0ef] bg-[#e8f0ef] px-4 py-3">
                      <AlertCircle size={17} className="text-[#183d3d]" />

                      <h3 className="text-sm font-bold text-[#183d3d]">
                        About your selected method
                      </h3>
                    </div>

                    <div className="flex items-start gap-3 p-4">
                      {(() => {
                        const selectedOption = checkoutOptions.find(
                          (option) => option.id === selectedCheckout,
                        );

                        const SelectedIcon = selectedOption?.icon || Truck;

                        const descriptions = {
                          "delivery-online": {
                            title: "Home delivery",
                            description:
                              "A flat delivery fee of LKR 300 will be added to your order total.",
                          },
                          "pickup-online": {
                            title: "Store pickup with online payment",
                            description:
                              "Pay online during checkout and collect your order from the store. There is no delivery fee.",
                          },
                          "pickup-store": {
                            title: "Store pickup with payment at collection",
                            description:
                              "Your order will be reserved for store pickup. Pay when you collect your order. There is no delivery fee.",
                          },
                        };

                        const details = descriptions[selectedCheckout];

                        return (
                          <>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8f0ef] text-[#183d3d]">
                              <SelectedIcon size={20} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-gray-900">
                                {details.title}
                              </p>

                              <p className="mt-1 text-sm leading-6 text-gray-600">
                                {details.description}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Order summary */}
            <aside className="self-start lg:sticky lg:top-32 lg:z-20 lg:h-fit">
              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                <div className="bg-[#183d3d] px-5 py-5 text-white sm:px-6">
                  <h2 className="text-lg font-bold">Order Summary</h2>

                  <p className="mt-1 text-sm text-white/75">
                    Review your order total
                  </p>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Subtotal ({totalQuantity} items)
                    </span>

                    <span className="font-semibold text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>

                    <span className="font-semibold text-gray-900">
                      {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                    </span>
                  </div>

                  <div className="rounded-xl bg-[#e8f0ef] p-3">
                    <div className="flex items-start gap-2">
                      <Check
                        size={17}
                        className="mt-0.5 shrink-0 text-[#183d3d]"
                      />

                      <div>
                        <p className="text-sm font-semibold text-[#183d3d]">
                          {selectedOption?.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-600">
                          {selectedOption?.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-gray-800">Total</span>

                      <span className="text-2xl font-bold tracking-tight text-[#183d3d]">
                        {formatPrice(total)}
                      </span>
                    </div>

                    <p className="mt-1 text-right text-xs text-gray-500">
                      {selectedCheckout === "pickup-store"
                        ? "Payment at store"
                        : "Including applicable shipping"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#183d3d] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#245454] focus:outline-none focus:ring-2 focus:ring-[#183d3d] focus:ring-offset-2"
                  >
                    Proceed to Checkout
                    <ChevronRight size={18} />
                  </button>

                  <div className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-[#183d3d]"
                    />

                    <p className="text-xs leading-5 text-gray-500">
                      Your order details will be reviewed before you complete
                      your purchase.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1 text-xs text-gray-500">
                    <CreditCard size={15} />
                    <span>Secure checkout experience</span>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
