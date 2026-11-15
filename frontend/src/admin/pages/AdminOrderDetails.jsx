import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Box,
} from "lucide-react";
import { getAdminOrderById, updateAdminOrder } from "../services/adminOrderApi";
import PageHeader from "../components/ui/PageHeader";

const formatLKR = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

const getStatusBadge = (status) => {
  const styles = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Processing: "bg-blue-100 text-blue-800 border-blue-200",
    Shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Delivered: "bg-green-100 text-green-800 border-green-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
    Paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Failed: "bg-red-100 text-red-800 border-red-200",
  };
  return `px-2.5 py-1 rounded-md text-xs font-semibold border ${styles[status] || "bg-gray-100 text-gray-800 border-gray-200"}`;
};

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Status update state
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await getAdminOrderById(orderId);
        setOrder(response.data);
      } catch (err) {
        setError(err.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const handleStatusUpdate = async (type, newStatus) => {
    setIsUpdating(true);
    setUpdateMessage("");
    setError("");

    try {
      // type is either 'orderStatus' or 'paymentStatus'
      const payload = { [type]: newStatus };
      const response = await updateAdminOrder(orderId, payload);

      // Update local state with the returned updated order
      setOrder(response.data);
      setUpdateMessage(
        `${type === "orderStatus" ? "Fulfillment" : "Payment"} status updated successfully.`,
      );

      // Clear success message after 3 seconds
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-500">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-[#183D3D]" />
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <AlertCircle className="mx-auto mb-2 h-8 w-8" />
        <p className="font-semibold">{error}</p>
        <button
          onClick={() => navigate("/admin/orders")}
          className="mt-4 rounded-lg bg-red-100 px-4 py-2 font-medium text-red-800 hover:bg-red-200"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Back Navigation */}
      <div className="flex flex-col gap-4">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#183D3D]"
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <PageHeader
            title={`Order ${order.orderNumber}`}
            description={`Placed on ${formatDate(order.createdAt)}`}
          />
          <div className="mt-4 flex gap-3 sm:mt-0">
            <span className={getStatusBadge(order.status.payment)}>
              Payment: {order.status.payment}
            </span>
            <span className={getStatusBadge(order.status.order)}>
              Order: {order.status.order}
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {updateMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          <CheckCircle size={20} />
          <p>{updateMessage}</p>
        </div>
      )}
      {error && order && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Order Items & Financials */}
        <div className="space-y-6 lg:col-span-2">
          {/* Ordered Items */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Box size={20} className="text-[#183D3D]" /> Ordered Items
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 p-1">
                    <img
                      src={item.image || "/images/product-placeholder.png"}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatLKR(item.price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatLKR(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatLKR(order.financials.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span>
                  {order.financials.shippingCost === 0
                    ? "Free"
                    : formatLKR(order.financials.shippingCost)}
                </span>
              </div>
              <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-lg font-bold text-gray-900">
                <span>Total Amount</span>
                <span className="text-[#183D3D]">
                  {formatLKR(order.financials.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Controls */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="rounded-xl border border-[#183D3D]/20 bg-[#F5F8F7] p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-[#183D3D]">
              Manage Order
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Fulfillment Status
                </label>
                <select
                  disabled={isUpdating}
                  value={order.status.order}
                  onChange={(e) =>
                    handleStatusUpdate("orderStatus", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#183D3D] focus:ring-1 focus:ring-[#183D3D] disabled:opacity-50"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Payment Status
                </label>
                <select
                  disabled={isUpdating}
                  value={order.status.payment}
                  onChange={(e) =>
                    handleStatusUpdate("paymentStatus", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#183D3D] focus:ring-1 focus:ring-[#183D3D] disabled:opacity-50"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <User size={20} className="text-gray-400" /> Customer
            </h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p>
                <a
                  href={`mailto:${order.customer.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {order.customer.email}
                </a>
              </p>
              <p>{order.customer.phone}</p>
            </div>
          </div>

          {/* Checkout & Delivery info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Package size={20} className="text-gray-400" /> Delivery Method
            </h2>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900">Method</p>
                <p>
                  {order.methods.checkoutMethod === "pickup-online" ||
                  order.methods.checkoutMethod === "pickup-store"
                    ? "Store Pickup"
                    : "Home Delivery"}
                </p>
                <p className="text-xs text-gray-500">
                  Payment: {order.methods.paymentMethod}
                </p>
              </div>

              {order.shippingAddress &&
                Object.keys(order.shippingAddress).length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="font-medium flex items-center gap-1 text-gray-900 mb-1">
                      <MapPin size={16} className="text-gray-400" /> Shipping
                      Address
                    </p>
                    <p>{order.shippingAddress.streetAddress}</p>
                    <p>{order.shippingAddress.city}</p>
                    <p>{order.shippingAddress.postcode}</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
