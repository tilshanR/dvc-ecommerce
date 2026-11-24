import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  MapPin,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Box,
  Truck,
  Store,
  FileText,
  Clock,
  Save,
  CreditCard,
  Banknote,
  Receipt,
  Copy,
  Check,
  ArrowRight,
  XCircle,
} from "lucide-react";
import { getAdminOrderById, updateAdminOrder } from "../services/adminOrderApi";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";

const PAYMENT_STATUS_OPTIONS = ["Pending", "Paid", "Failed", "Refunded"];

const formatLKR = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  const [courierProvider, setCourierProvider] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  // Guardrail state for destructive transitions (Cancelled / Refunded)
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  // Clipboard feedback state
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchOrderDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getAdminOrderById(orderId);
        if (!isMounted) return;

        const fetchedOrder = response?.data || response;
        setOrder(fetchedOrder);
        setCourierProvider(fetchedOrder?.fulfillment?.courierProvider || "");
        setTrackingNumber(fetchedOrder?.fulfillment?.trackingNumber || "");
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load order details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrderDetails();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const showSuccessFeedback = (msg) => {
    setUpdateMessage(msg);
    setTimeout(() => setUpdateMessage(""), 3500);
  };

  const handleCopy = async (key, value) => {
    if (!value || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 2000);
    } catch {
      // Ignore clipboard permission errors silently
    }
  };

  const executeOrderPatch = async (payload, successText) => {
    setIsUpdating(true);
    setUpdateMessage("");
    setError("");
    setPendingConfirmation(null);

    try {
      const response = await updateAdminOrder(orderId, payload);
      const updatedOrder = response?.data || response;

      setOrder(updatedOrder);
      setCourierProvider(updatedOrder?.fulfillment?.courierProvider || "");
      setTrackingNumber(updatedOrder?.fulfillment?.trackingNumber || "");

      showSuccessFeedback(successText);
    } catch (err) {
      setError(err.message || "Failed to update order.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusSelectChange = (type, newStatus) => {
    const currentStatus =
      type === "orderStatus"
        ? order?.status?.orderStatus
        : order?.status?.paymentStatus;

    if (newStatus === currentStatus) return;

    // Require inline confirmation for destructive/irreversible transitions
    if (newStatus === "Cancelled" || newStatus === "Refunded") {
      setPendingConfirmation({ type, value: newStatus });
      return;
    }

    executeOrderPatch(
      { [type]: newStatus },
      `${type === "orderStatus" ? "Fulfillment" : "Payment"} status updated to "${newStatus}".`,
    );
  };

  const handleFulfillmentSave = (e) => {
    e.preventDefault();
    executeOrderPatch(
      {
        courierProvider: courierProvider.trim(),
        trackingNumber: trackingNumber.trim(),
      },
      "Courier tracking details saved.",
    );
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-(--admin-muted)">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-(--admin-brand-text)" />
          <p className="text-sm font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if ((error && !order) || !order) {
    return (
      <div className="rounded-xl border border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) p-6 text-center text-(--admin-status-danger-text)">
        <AlertCircle className="mx-auto mb-2 h-8 w-8" />
        <p className="font-semibold">{error || "Order not found."}</p>
        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="mt-4 rounded-lg bg-(--admin-brand) px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--admin-brand-hover)"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const checkoutMethod = order.methods?.checkoutMethod;
  const paymentMethod = order.methods?.paymentMethod || "Online Payment";
  const isPickup =
    checkoutMethod === "pickup-online" || checkoutMethod === "pickup-store";
  const isPayAtStore =
    checkoutMethod === "pickup-store" || paymentMethod === "Pay at Store";
  const isOnlinePayment = paymentMethod === "Online Payment";

  const currentPaymentStatus = order.status?.paymentStatus || "Pending";
  const currentOrderStatus = order.status?.orderStatus || "Pending";

  const lifecycleStages = isPickup
    ? ["Pending", "Processing", "Ready for Pickup", "Delivered"]
    : ["Pending", "Processing", "Shipped", "Delivered"];

  const activeStageIndex = lifecycleStages.indexOf(currentOrderStatus);

  const orderStatusOptions = lifecycleStages.includes(currentOrderStatus)
    ? [...lifecycleStages, "Cancelled"]
    : [...lifecycleStages, currentOrderStatus, "Cancelled"];

  // Lock Online Payment mutations unless transitioning a Paid order to Refunded
  const isPaymentSelectDisabled =
    isUpdating || (isOnlinePayment && currentPaymentStatus !== "Paid");

  const availablePaymentOptions =
    isOnlinePayment && currentPaymentStatus === "Paid"
      ? ["Paid", "Refunded"]
      : PAYMENT_STATUS_OPTIONS;

  // Contextual one-click forward progression
  const nextStepConfig = (() => {
    if (currentOrderStatus === "Pending") {
      return {
        label: "Accept & Start Processing",
        nextStatus: "Processing",
      };
    }
    if (currentOrderStatus === "Processing") {
      return isPickup
        ? { label: "Mark Ready for Pickup", nextStatus: "Ready for Pickup" }
        : {
            label: "Mark as Shipped",
            nextStatus: "Shipped",
            includeTracking: true,
          };
    }
    if (currentOrderStatus === "Ready for Pickup") {
      return { label: "Complete Store Pickup", nextStatus: "Delivered" };
    }
    if (currentOrderStatus === "Shipped") {
      return { label: "Mark as Delivered", nextStatus: "Delivered" };
    }
    return null;
  })();

  const totalUnits = (order.items || []).reduce(
    (sum, item) => sum + (Number(item.quantity) || 1),
    0,
  );

  const addressLines = [
    order.shippingAddress?.streetAddress ||
      order.shippingAddress?.address ||
      order.shippingAddress?.line1,
    order.shippingAddress?.city,
    order.shippingAddress?.postcode || order.shippingAddress?.postalCode,
  ].filter(Boolean);

  const formattedAddressCopy = [
    `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim(),
    order.customer?.phone,
    ...addressLines,
  ]
    .filter(Boolean)
    .join(", ");

  const needsCounterCollection =
    isPayAtStore &&
    currentPaymentStatus === "Pending" &&
    currentOrderStatus !== "Cancelled";

  return (
    <div className="w-full space-y-6">
      {/* Top Navigation & Order Header */}
      <div className="flex flex-col gap-3">
        <Link
          to="/orders"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-(--admin-muted) transition-colors hover:text-(--admin-brand-text)"
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-2.5">
            <PageHeader
              title={`Order ${order.orderNumber}`}
              description={`Placed on ${formatDate(order.createdAt)}`}
            />
            <button
              type="button"
              onClick={() => handleCopy("orderNumber", order.orderNumber)}
              title="Copy order number"
              className="mt-1 inline-flex items-center gap-1 rounded-md border border-(--admin-border) bg-(--admin-surface) px-2 py-1 text-xs font-medium text-(--admin-muted) transition-colors hover:border-(--admin-brand) hover:text-(--admin-text)"
            >
              {copiedKey === "orderNumber" ? (
                <>
                  <Check
                    size={13}
                    className="text-(--admin-status-success-text)"
                  />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={13} />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge type="payment" status={currentPaymentStatus} />
            <StatusBadge type="order" status={currentOrderStatus} />
          </div>
        </div>
      </div>

      {/* Feedback Alerts */}
      {updateMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-(--admin-status-success-border) bg-(--admin-status-success-bg) p-4 text-sm text-(--admin-status-success-text)">
          <CheckCircle size={18} className="shrink-0" />
          <p>{updateMessage}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) p-4 text-sm text-(--admin-status-danger-text)">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Above-the-Fold At-a-Glance Operational Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Fulfillment Channel */}
        <div className="rounded-xl border border-(--admin-border) bg-(--admin-surface) p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-(--admin-muted)">
              Fulfillment Channel
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--admin-brand-soft) text-(--admin-brand-text)">
              {isPickup ? <Store size={16} /> : <Truck size={16} />}
            </span>
          </div>
          <p className="mt-2 text-base font-bold text-(--admin-text)">
            {isPickup ? "Store Pickup" : "Home Delivery"}
          </p>
          <p className="mt-0.5 truncate text-xs text-(--admin-muted)">
            {isPickup
              ? "Customer collects at store counter"
              : order.shippingAddress?.city
                ? `Courier dispatch to ${order.shippingAddress.city}`
                : "Courier dispatch to customer"}
          </p>
        </div>

        {/* Card 2: Payment Method & Collection State */}
        <div className="rounded-xl border border-(--admin-border) bg-(--admin-surface) p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-(--admin-muted)">
              Payment & Method
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--admin-brand-soft) text-(--admin-brand-text)">
              {isPayAtStore ? <Banknote size={16} /> : <CreditCard size={16} />}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="truncate text-base font-bold text-(--admin-text)">
              {paymentMethod}
            </p>
            <StatusBadge type="payment" status={currentPaymentStatus} />
          </div>
          <p
            className={`mt-1 text-xs font-medium ${
              needsCounterCollection
                ? "text-(--admin-status-warning-text)"
                : "text-(--admin-muted)"
            }`}
          >
            {needsCounterCollection
              ? `Collect ${formatLKR(order.financials?.total)} at counter`
              : isOnlinePayment
                ? "Processed via PayHere"
                : "In-store payment settled"}
          </p>
        </div>

        {/* Card 3: Order Value & Volume */}
        <div className="rounded-xl border border-(--admin-border) bg-(--admin-surface) p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-(--admin-muted)">
              Order Total
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--admin-brand-soft) text-(--admin-brand-text)">
              <Receipt size={16} />
            </span>
          </div>
          <p className="mt-2 text-base font-bold text-(--admin-brand-text)">
            {formatLKR(order.financials?.total)}
          </p>
          <p className="mt-0.5 text-xs text-(--admin-muted)">
            {totalUnits} {totalUnits === 1 ? "unit" : "units"} ·{" "}
            {Number(order.financials?.shippingCost || 0) === 0
              ? "Free shipping"
              : `${formatLKR(order.financials?.shippingCost)} shipping`}
          </p>
        </div>

        {/* Card 4: Customer & Quick Contact */}
        <div className="rounded-xl border border-(--admin-border) bg-(--admin-surface) p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-(--admin-muted)">
              Customer
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--admin-brand-soft) text-(--admin-brand-text)">
              <User size={16} />
            </span>
          </div>
          <p className="mt-2 truncate text-base font-bold text-(--admin-text)">
            {order.customer?.firstName} {order.customer?.lastName}
          </p>
          <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-(--admin-muted)">
            <span className="truncate">
              {order.customer?.phone || order.customer?.email || "—"}
            </span>
            {order.customer?.phone && (
              <button
                type="button"
                onClick={() => handleCopy("phoneTop", order.customer.phone)}
                className="inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 font-medium text-(--admin-brand-text) transition-colors hover:bg-(--admin-hover)"
              >
                {copiedKey === "phoneTop" ? (
                  <>
                    <Check size={12} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Copy
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Fulfillment Lifecycle Stepper */}
      {currentOrderStatus === "Cancelled" ? (
        <div className="flex items-center gap-3 rounded-xl border border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) px-5 py-3.5 text-sm text-(--admin-status-danger-text)">
          <XCircle size={18} className="shrink-0" />
          <span className="font-semibold">
            This order has been cancelled.
          </span>
        </div>
      ) : (
        <div className="rounded-xl border border-(--admin-border) bg-(--admin-surface) px-6 py-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {lifecycleStages.map((stage, index) => {
              const isCompleted =
                activeStageIndex !== -1 && index < activeStageIndex;
              const isCurrent = index === activeStageIndex;

              return (
                <div
                  key={stage}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    isCurrent
                      ? "border-(--admin-brand) bg-(--admin-brand-soft) text-(--admin-brand-text)"
                      : isCompleted
                        ? "border-(--admin-status-success-border) bg-(--admin-status-success-bg) text-(--admin-status-success-text)"
                        : "border-(--admin-border) bg-(--admin-bg) text-(--admin-muted)"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isCurrent
                        ? "bg-(--admin-brand) text-white"
                        : isCompleted
                          ? "bg-(--admin-status-success-text) text-white"
                          : "border border-(--admin-border) bg-(--admin-surface) text-(--admin-muted)"
                    }`}
                  >
                    {isCompleted ? <Check size={11} /> : index + 1}
                  </span>
                  <span className="truncate">{stage}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main 12-Column Workspace */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (8 Cols): Order Notes, Line Items & Financial Breakdown */}
        <div className="space-y-6 lg:col-span-8">
          {/* Promoted Customer / Order Notes */}
          {order.notes && (
            <div className="flex items-start gap-3 rounded-xl border border-(--admin-status-warning-border) bg-(--admin-status-warning-bg) p-4 text-sm text-(--admin-status-warning-text)">
              <FileText size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Customer / Order Notes</p>
                <p className="mt-1 whitespace-pre-line opacity-90">
                  {order.notes}
                </p>
              </div>
            </div>
          )}

          {/* Ordered Items */}
          <div className="overflow-hidden rounded-xl border border-(--admin-border) bg-(--admin-surface) shadow-sm">
            <div className="flex items-center justify-between border-b border-(--admin-border) px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-(--admin-text)">
                <Box size={18} className="text-(--admin-brand-text)" />
                Ordered Items ({order.items?.length || 0})
              </h2>
              <span className="text-xs font-medium text-(--admin-muted)">
                {totalUnits} total {totalUnits === 1 ? "unit" : "units"}
              </span>
            </div>

            <div className="divide-y divide-(--admin-border)">
              {(order.items || []).map((item, index) => (
                <div
                  key={item.productId || item._id || index}
                  className="flex items-center gap-4 px-6 py-4"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-(--admin-border) bg-(--admin-bg) p-1">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Box size={22} className="text-(--admin-muted)" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-(--admin-text)">
                      {item.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-(--admin-muted)">
                      Qty: {item.quantity} × {formatLKR(item.price)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-(--admin-text)">
                      {formatLKR(
                        (Number(item.price) || 0) *
                          (Number(item.quantity) || 1),
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="rounded-xl border border-(--admin-border) bg-(--admin-surface) p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-(--admin-text)">
              Payment Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-(--admin-muted)">
                <span>Subtotal</span>
                <span className="font-medium text-(--admin-text)">
                  {formatLKR(order.financials?.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-(--admin-muted)">
                <span>Shipping Fee</span>
                <span className="font-medium text-(--admin-text)">
                  {Number(order.financials?.shippingCost || 0) === 0
                    ? "Free"
                    : formatLKR(order.financials?.shippingCost)}
                </span>
              </div>
              <div className="mt-4 flex justify-between border-t border-(--admin-border) pt-4 text-base font-bold text-(--admin-text)">
                <span>Total Amount</span>
                <span className="text-(--admin-brand-text)">
                  {formatLKR(order.financials?.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols): Action Panel & Destination Details */}
        <div className="space-y-6 lg:col-span-4">
          {/* Manage Order Panel */}
          <div className="rounded-xl border border-(--admin-border) bg-(--admin-brand-soft) p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-(--admin-brand-text)">
              Manage Order
            </h2>

            <div className="space-y-4">
              {/* Contextual One-Click Forward Action */}
              {nextStepConfig && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => {
                    const payload = { orderStatus: nextStepConfig.nextStatus };
                    if (nextStepConfig.includeTracking) {
                      if (courierProvider.trim()) {
                        payload.courierProvider = courierProvider.trim();
                      }
                      if (trackingNumber.trim()) {
                        payload.trackingNumber = trackingNumber.trim();
                      }
                    }
                    executeOrderPatch(
                      payload,
                      `Order moved to "${nextStepConfig.nextStatus}".`,
                    );
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-(--admin-brand) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-(--admin-brand-hover) disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <span>{nextStepConfig.label}</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {/* Destructive Status Confirmation Guardrail */}
              {pendingConfirmation && (
                <div className="rounded-lg border border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) p-3.5 text-xs text-(--admin-status-danger-text)">
                  <p className="font-semibold">
                    Confirm marking order as "{pendingConfirmation.value}"?
                  </p>
                  <p className="mt-1 opacity-90">
                    {pendingConfirmation.value === "Cancelled"
                      ? "This will halt fulfillment for this order."
                      : "This records that the customer payment has been refunded."}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        executeOrderPatch(
                          {
                            [pendingConfirmation.type]:
                              pendingConfirmation.value,
                          },
                          `Status updated to "${pendingConfirmation.value}".`,
                        )
                      }
                      className="rounded-md bg-(--admin-status-danger-text) px-3 py-1.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => setPendingConfirmation(null)}
                      className="rounded-md border border-(--admin-border) bg-(--admin-surface) px-3 py-1.5 font-semibold text-(--admin-text) transition-colors hover:bg-(--admin-hover)"
                    >
                      Keep Current
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="order-status-select"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--admin-text)"
                >
                  Fulfillment Status
                </label>
                <select
                  id="order-status-select"
                  disabled={isUpdating}
                  value={currentOrderStatus}
                  onChange={(e) =>
                    handleStatusSelectChange("orderStatus", e.target.value)
                  }
                  className="w-full rounded-lg border border-(--admin-border) bg-(--admin-input-bg) px-3 py-2 text-sm text-(--admin-text) outline-none transition-colors focus:border-(--admin-brand) focus:ring-1 focus:ring-(--admin-brand) disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {orderStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="payment-status-select"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-(--admin-text)"
                >
                  Payment Status
                </label>
                <select
                  id="payment-status-select"
                  disabled={isPaymentSelectDisabled}
                  value={currentPaymentStatus}
                  onChange={(e) =>
                    handleStatusSelectChange("paymentStatus", e.target.value)
                  }
                  className="w-full rounded-lg border border-(--admin-border) bg-(--admin-input-bg) px-3 py-2 text-sm text-(--admin-text) outline-none transition-colors focus:border-(--admin-brand) focus:ring-1 focus:ring-(--admin-brand) disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {availablePaymentOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {isOnlinePayment && (
                  <p className="mt-1.5 text-xs text-(--admin-muted)">
                    {currentPaymentStatus === "Paid"
                      ? "Paid via PayHere. Only Refunded transition is manually enabled."
                      : "Managed automatically by PayHere payment notifications."}
                  </p>
                )}
              </div>

              {/* Courier & Tracking Form for Delivery Orders */}
              {!isPickup && (
                <form
                  onSubmit={handleFulfillmentSave}
                  className="space-y-3 border-t border-(--admin-border) pt-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-(--admin-text)">
                    Courier Tracking
                  </p>

                  <div>
                    <label
                      htmlFor="courier-provider"
                      className="mb-1 block text-xs text-(--admin-muted)"
                    >
                      Courier Provider
                    </label>
                    <input
                      id="courier-provider"
                      type="text"
                      value={courierProvider}
                      onChange={(e) => setCourierProvider(e.target.value)}
                      placeholder="e.g., Domex, Pronto, Grasshoppers"
                      disabled={isUpdating}
                      className="w-full rounded-lg border border-(--admin-border) bg-(--admin-input-bg) px-3 py-2 text-sm text-(--admin-text) placeholder:text-(--admin-muted) focus:border-(--admin-brand) focus:outline-none focus:ring-1 focus:ring-(--admin-brand) disabled:opacity-55"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tracking-number"
                      className="mb-1 block text-xs text-(--admin-muted)"
                    >
                      Tracking Number
                    </label>
                    <input
                      id="tracking-number"
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter waybill / tracking ID"
                      disabled={isUpdating}
                      className="w-full rounded-lg border border-(--admin-border) bg-(--admin-input-bg) px-3 py-2 text-sm text-(--admin-text) placeholder:text-(--admin-muted) focus:border-(--admin-brand) focus:outline-none focus:ring-1 focus:ring-(--admin-brand) disabled:opacity-55"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-(--admin-brand) bg-(--admin-surface) px-4 py-2 text-sm font-semibold text-(--admin-brand-text) transition-colors hover:bg-(--admin-brand) hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <Save size={15} />
                    Save Tracking Details
                  </button>
                </form>
              )}

              {/* Fulfillment Timestamps */}
              {(order.fulfillment?.dispatchedAt ||
                order.fulfillment?.deliveredAt) && (
                <div className="space-y-1.5 border-t border-(--admin-border) pt-3 text-xs text-(--admin-muted)">
                  {order.fulfillment?.dispatchedAt && (
                    <p className="flex items-center gap-1.5">
                      <Clock size={13} />
                      Dispatched: {formatDate(order.fulfillment.dispatchedAt)}
                    </p>
                  )}
                  {order.fulfillment?.deliveredAt && (
                    <p className="flex items-center gap-1.5">
                      <CheckCircle size={13} />
                      {isPickup ? "Picked Up" : "Delivered"}:{" "}
                      {formatDate(order.fulfillment.deliveredAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Consolidated Customer & Destination Card */}
          <div className="rounded-xl border border-(--admin-border) bg-(--admin-surface) p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-(--admin-text)">
              <User size={18} className="text-(--admin-brand-text)" />
              Customer & Destination
            </h2>

            <div className="space-y-4 text-sm text-(--admin-muted)">
              <div className="space-y-1.5">
                <p className="font-semibold text-(--admin-text)">
                  {order.customer?.firstName} {order.customer?.lastName}
                </p>
                {order.customer?.email && (
                  <p>
                    <a
                      href={`mailto:${order.customer.email}`}
                      className="text-(--admin-brand-text) hover:underline"
                    >
                      {order.customer.email}
                    </a>
                  </p>
                )}
                {order.customer?.phone && (
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={`tel:${order.customer.phone}`}
                      className="hover:text-(--admin-text) hover:underline"
                    >
                      {order.customer.phone}
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy("phoneCard", order.customer.phone)
                      }
                      className="inline-flex items-center gap-1 rounded border border-(--admin-border) bg-(--admin-bg) px-2 py-0.5 text-xs font-medium text-(--admin-text) transition-colors hover:border-(--admin-brand)"
                    >
                      {copiedKey === "phoneCard" ? (
                        <>
                          <Check
                            size={12}
                            className="text-(--admin-status-success-text)"
                          />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {!isPickup && addressLines.length > 0 && (
                <div className="border-t border-(--admin-border) pt-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="flex items-center gap-1.5 font-medium text-(--admin-text)">
                      <MapPin size={15} className="text-(--admin-muted)" />
                      Shipping Address
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy("address", formattedAddressCopy)
                      }
                      className="inline-flex items-center gap-1 rounded border border-(--admin-border) bg-(--admin-bg) px-2 py-0.5 text-xs font-medium text-(--admin-text) transition-colors hover:border-(--admin-brand)"
                    >
                      {copiedKey === "address" ? (
                        <>
                          <Check
                            size={12}
                            className="text-(--admin-status-success-text)"
                          />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy Waybill Info
                        </>
                      )}
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    {addressLines.map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}