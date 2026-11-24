import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  ArrowRight,
  Mail,
  ShieldCheck,
  Clock,
  Store,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getOrderById } from "../services/orderApi";
import { formatLKR } from "../utils/checkoutUtils";

const MAX_POLL_ATTEMPTS = 8; // ~16 seconds for PayHere webhook confirmation
const POLL_INTERVAL_MS = 2000;

const formatDateTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pollAttempts, setPollAttempts] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let pollTimer = null;

    const fetchOrder = async (attempt = 0) => {
      try {
        const response = await getOrderById(orderId);
        if (!isMounted) return;

        const fetchedOrder = response?.data || response;
        setOrder(fetchedOrder);
        setError("");
        setLoading(false);

        const isOnline =
          fetchedOrder?.methods?.paymentMethod === "Online Payment";
        const paymentStatus = fetchedOrder?.status?.payment;
        const orderStatus = fetchedOrder?.status?.order;

        // PayHere webhook may land a couple seconds after client-side redirect
        if (
          isOnline &&
          paymentStatus === "Pending" &&
          orderStatus !== "Cancelled" &&
          attempt < MAX_POLL_ATTEMPTS
        ) {
          setPollAttempts(attempt + 1);
          pollTimer = setTimeout(() => {
            fetchOrder(attempt + 1);
          }, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "We could not load your order details.",
        );
        setLoading(false);
      }
    };

    setLoading(true);
    setPollAttempts(0);
    fetchOrder(0);

    return () => {
      isMounted = false;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [orderId]);

  if (loading) {
    return (
      <main className="flex min-h-[85vh] items-center justify-center bg-gray-50 px-4 py-12">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <RefreshCw className="h-9 w-9 animate-spin text-[#183d3d]" />
          <p className="text-sm font-medium">Loading your order details...</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-[85vh] items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
          <p className="mt-2 text-sm text-gray-600">
            {error || "Please check your order link and try again."}
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#183d3d] px-6 py-3 text-sm font-semibold text-white hover:bg-[#245454]"
          >
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const paymentMethod = order.methods?.paymentMethod || "Online Payment";
  const checkoutMethod = order.methods?.checkoutMethod;
  const paymentStatus = order.status?.payment || "Pending";
  const orderStatus = order.status?.order || "Pending";

  const isPayAtStore =
    paymentMethod === "Pay at Store" || checkoutMethod === "pickup-store";
  const isCancelledOrFailed =
    orderStatus === "Cancelled" || paymentStatus === "Failed";
  const isRefunded = paymentStatus === "Refunded";
  const isVerifyingOnline =
    !isPayAtStore && !isCancelledOrFailed && paymentStatus === "Pending";
  const isPolling = isVerifyingOnline && pollAttempts < MAX_POLL_ATTEMPTS;

  const expiresAtFormatted = formatDateTime(order.expiresAt);

  // Derive visual presentation from verified backend state
  const uiState = (() => {
    if (isCancelledOrFailed || isRefunded) {
      return {
        pageBg: "from-red-50/70 via-white to-white",
        ringOuter: "bg-red-100/70",
        ringInner: "bg-red-100",
        iconColor: "text-red-600",
        badgeClass: "bg-red-50 text-red-700",
        cardClass: "border-red-100 bg-red-50/50",
        pillClass: "bg-red-100 text-red-700",
        badgeText: isRefunded
          ? "Payment Refunded"
          : paymentStatus === "Failed"
            ? "Payment Failed"
            : "Order Cancelled",
        pillText: orderStatus,
        title: isRefunded ? "Order Refunded" : "Order Not Completed",
        subtitle: `Hi ${order.customer?.firstName || "there"}, this order is currently marked as ${orderStatus.toLowerCase()}. Reserved items have been released back to stock.`,
        MainIcon: XCircle,
      };
    }

    if (isVerifyingOnline) {
      return {
        pageBg: "from-amber-50/70 via-white to-white",
        ringOuter: "bg-amber-100/70",
        ringInner: "bg-amber-100",
        iconColor: "text-amber-600",
        badgeClass: "bg-amber-50 text-amber-800",
        cardClass: "border-amber-100 bg-amber-50/50",
        pillClass: "bg-amber-100 text-amber-800",
        badgeText: isPolling ? "Verifying Payment" : "Payment Pending",
        pillText: "Awaiting Confirmation",
        title: isPolling
          ? "Confirming Your Payment..."
          : "Payment Pending Confirmation",
        subtitle: isPolling
          ? `Hang tight, ${order.customer?.firstName || "there"} — we're confirming your PayHere transaction now.`
          : `We haven't received final confirmation from PayHere yet. If you completed payment, your order will update automatically once processed.`,
        MainIcon: Clock,
      };
    }

    if (isPayAtStore) {
      return {
        pageBg: "from-emerald-50/70 via-white to-white",
        ringOuter: "bg-emerald-100/70",
        ringInner: "bg-emerald-100",
        iconColor: "text-emerald-600",
        badgeClass: "bg-amber-50 text-amber-800",
        cardClass: "border-emerald-100 bg-emerald-50/50",
        pillClass: "bg-amber-100 text-amber-800",
        badgeText: "Reserved · Pay at Store",
        pillText: paymentStatus === "Paid" ? "Paid" : "Pay at Counter",
        title: "Order Reserved!",
        subtitle: `Thank you, ${order.customer?.firstName || "there"}! Your items have been reserved for in-store pickup. Please bring your order number when collecting.`,
        MainIcon: Store,
      };
    }

    return {
      pageBg: "from-emerald-50/70 via-white to-white",
      ringOuter: "bg-emerald-100/70",
      ringInner: "bg-emerald-100",
      iconColor: "text-emerald-600",
      badgeClass: "bg-emerald-50 text-emerald-700",
      cardClass: "border-emerald-100 bg-emerald-50/50",
      pillClass: "bg-emerald-100 text-emerald-700",
      badgeText: "Payment Successful",
      pillText: orderStatus === "Pending" ? "Confirmed" : orderStatus,
      title: "Order Confirmed!",
      subtitle: `Thank you, ${order.customer?.firstName || "there"}! Your payment has been confirmed and we're preparing your order.`,
      MainIcon: CheckCircle2,
    };
  })();

  const { MainIcon } = uiState;

  return (
    <main
      className={`flex min-h-[85vh] items-center justify-center bg-linear-to-b ${uiState.pageBg} px-4 py-12`}
    >
      <div className="w-full max-w-xl">
        {/* Status Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="relative flex items-center justify-center">
            <div
              className={`absolute h-36 w-36 rounded-full ${uiState.ringOuter}`}
            />
            <div
              className={`relative flex h-28 w-28 items-center justify-center rounded-full shadow-inner ${uiState.ringInner}`}
            >
              <MainIcon
                size={60}
                strokeWidth={1.8}
                className={`${uiState.iconColor} ${isPolling ? "animate-pulse" : ""}`}
              />
            </div>
            <div className="absolute -right-3 bottom-1 rounded-full bg-white p-3 shadow-md">
              <PackageCheck size={24} className={uiState.iconColor} />
            </div>
          </div>
        </div>

        {/* Main Confirmation Card */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
          <div className="px-6 pt-9 pb-7 text-center sm:px-10">
            <span
              className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider ${uiState.badgeClass}`}
            >
              {isPolling ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <MainIcon size={15} />
              )}
              {uiState.badgeText}
            </span>

            <h1 className="mb-3 text-3xl font-bold tracking-tight text-[#183d3d] sm:text-4xl">
              {uiState.title}
            </h1>

            <p className="mx-auto max-w-md text-base leading-relaxed text-gray-500">
              {uiState.subtitle}
            </p>
          </div>

          {/* Order Information */}
          <div
            className={`mx-6 mb-6 rounded-2xl border p-5 sm:mx-10 ${uiState.cardClass}`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-500">
                Order Number
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${uiState.pillClass}`}
              >
                {uiState.pillText}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold tracking-wide text-[#183d3d] sm:text-2xl">
                #{order.orderNumber}
              </h2>
              <span className="text-base font-bold text-[#183d3d]">
                {formatLKR(order.financials?.total)}
              </span>
            </div>

            {isPayAtStore && !isCancelledOrFailed && expiresAtFormatted && (
              <p className="mt-3 border-t border-emerald-200/60 pt-3 text-xs text-gray-600">
                Reservation held until{" "}
                <span className="font-semibold text-gray-800">
                  {expiresAtFormatted}
                </span>
                . Unclaimed orders are automatically cancelled after this
                window.
              </p>
            )}
          </div>

          {/* Contextual Next Steps */}
          <div className="mx-6 mb-8 space-y-4 sm:mx-10">
            <div className="flex items-start gap-4 rounded-xl border border-gray-100 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <Mail size={21} className="text-emerald-700" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-gray-800">
                  Order Updates
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  Updates for this order are linked to{" "}
                  <span className="font-medium text-gray-700">
                    {order.customer?.email}
                  </span>
                  . Keep your order number{" "}
                  <span className="font-medium text-gray-700">
                    #{order.orderNumber}
                  </span>{" "}
                  handy if you contact support.
                </p>
              </div>
            </div>

            {!isCancelledOrFailed && (
              <div className="flex items-start gap-4 rounded-xl border border-gray-100 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <ShieldCheck size={21} className="text-emerald-700" />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-gray-800">
                    {isPayAtStore
                      ? "Store Counter Collection"
                      : checkoutMethod === "pickup-online"
                        ? "Prepaid Store Pickup"
                        : "Home Delivery"}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {isPayAtStore
                      ? `Please pay ${formatLKR(order.financials?.total)} at our store counter when collecting your items.`
                      : checkoutMethod === "pickup-online"
                        ? "We'll notify you as soon as your prepaid order is packed and ready for pickup."
                        : "Once packed, your order will be dispatched via courier to your delivery address."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-7 sm:px-10">
            <Link
              to="/shop"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#183d3d] px-6 py-4 font-semibold text-white shadow-lg shadow-[#183d3d]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#245454] hover:shadow-xl"
            >
              <ShoppingBag size={19} />
              Continue Shopping
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <p className="mt-4 text-center text-xs text-gray-400">
              Thank you for shopping with DVC Store.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
