import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Package,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Truck,
  Store,
  Search,
  Clock,
} from "lucide-react";
import { getAdminOrders } from "../services/adminOrderApi";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";

const ORDER_STATUS_OPTIONS = [
  "All",
  "Pending",
  "Processing",
  "Ready for Pickup",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const PAYMENT_STATUS_OPTIONS = ["All", "Pending", "Paid", "Failed", "Refunded"];

const CHECKOUT_METHOD_META = {
  "delivery-online": { label: "Home Delivery", isPickup: false },
  "pickup-online": { label: "Store Pickup (Online)", isPickup: true },
  "pickup-store": { label: "Store Pickup (Pay at Store)", isPickup: true },
};

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

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const limit = 10;


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const params = { page, limit };
        if (statusFilter !== "All") params.orderStatus = statusFilter;
        if (paymentFilter !== "All") params.paymentStatus = paymentFilter;
        if (debouncedSearch) params.search = debouncedSearch;

        const response = await getAdminOrders(params);
        if (!isMounted) return;

        let extractedOrders = [];
        if (Array.isArray(response?.data)) {
          extractedOrders = response.data;
        } else if (Array.isArray(response?.data?.orders)) {
          extractedOrders = response.data.orders;
        } else if (Array.isArray(response?.orders)) {
          extractedOrders = response.orders;
        }

        setOrders(extractedOrders);

        const paginationData =
          response?.pagination || response?.data?.pagination || {};
        setTotalPages(Math.max(1, paginationData.totalPages || 1));
        setTotalOrders(paginationData.total ?? extractedOrders.length);
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load orders.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [page, statusFilter, paymentFilter, debouncedSearch]);

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handlePaymentFilterChange = (e) => {
    setPaymentFilter(e.target.value);
    setPage(1);
  };

  const rangeStart = totalOrders === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, totalOrders);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Order Management"
          description={`View and manage ${totalOrders} customer ${totalOrders === 1 ? "order" : "orders"}.`}
        />

        <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-60">
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--admin-muted)"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Order #, email, or phone..."
              aria-label="Search orders"
              className="w-full rounded-lg border border-(--admin-border) bg-(--admin-input-bg) py-2 pr-3 pl-9 text-sm text-(--admin-text) placeholder:text-(--admin-muted) transition-colors focus:border-(--admin-brand) focus:outline-none focus:ring-1 focus:ring-(--admin-brand)"
            />
          </div>

          <div className="w-full sm:w-44">
            <label htmlFor="payment-status-filter" className="sr-only">
              Filter by payment status
            </label>
            <select
              id="payment-status-filter"
              value={paymentFilter}
              onChange={handlePaymentFilterChange}
              className="w-full rounded-lg border border-(--admin-border) bg-(--admin-input-bg) px-3 py-2 text-sm text-(--admin-text) transition-colors focus:border-(--admin-brand) focus:outline-none focus:ring-1 focus:ring-(--admin-brand)"
            >
              {PAYMENT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All Payments" : status}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-52">
            <label htmlFor="order-status-filter" className="sr-only">
              Filter by order status
            </label>
            <select
              id="order-status-filter"
              value={statusFilter}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-(--admin-border) bg-(--admin-input-bg) px-3 py-2 text-sm text-(--admin-text) transition-colors focus:border-(--admin-brand) focus:outline-none focus:ring-1 focus:ring-(--admin-brand)"
            >
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All Fulfillment Statuses" : status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) p-4 text-sm text-(--admin-status-danger-text)">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-(--admin-border) bg-(--admin-surface) shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-(--admin-border) text-left text-sm">
            <thead className="bg-(--admin-bg) text-(--admin-muted)">
              <tr>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">
                  Customer & Method
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">
                  Fulfillment
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-(--admin-border) bg-(--admin-surface)">
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="py-14 text-center text-(--admin-muted)"
                  >
                    <div className="mb-2 flex justify-center">
                      <Package
                        className="animate-pulse text-(--admin-brand-text)"
                        size={30}
                      />
                    </div>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="py-14 text-center text-(--admin-muted)"
                  >
                    No orders found matching the selected filter.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const targetId = order.id || order._id;
                  const checkoutMeta = CHECKOUT_METHOD_META[
                    order.methods?.checkoutMethod
                  ] || {
                    label: order.methods?.checkoutMethod || "Standard",
                    isPickup: false,
                  };
                  const itemCount = Array.isArray(order.items)
                    ? order.items.reduce(
                        (sum, item) => sum + (Number(item.quantity) || 1),
                        0,
                      )
                    : 0;

                  return (
                    <tr
                      key={targetId}
                      className="transition-colors hover:bg-(--admin-hover)"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          to={`/orders/${targetId}`}
                          className="font-semibold text-(--admin-brand-text) hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-(--admin-muted)">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-(--admin-text)">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-(--admin-muted)">
                          {checkoutMeta.isPickup ? (
                            <Store size={13} className="shrink-0" />
                          ) : (
                            <Truck size={13} className="shrink-0" />
                          )}
                          <span>{checkoutMeta.label}</span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-(--admin-muted)">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-(--admin-text)">
                        {formatLKR(order.financials?.total)}
                      </td>

               
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge
                            type="payment"
                            status={order.status?.paymentStatus || "Pending"}
                          />
                          {order.status?.orderStatus === "Pending" &&
                            order.status?.paymentStatus === "Pending" &&
                            order.expiresAt && (
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                  new Date(order.expiresAt) <= new Date()
                                    ? "text-(--admin-status-danger-text)"
                                    : "text-(--admin-muted)"
                                }`}
                              >
                                <Clock size={11} />
                                {new Date(order.expiresAt) <= new Date()
                                  ? "Expiring soon"
                                  : `Exp. ${formatDate(order.expiresAt)}`}
                              </span>
                            )}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <StatusBadge
                          type="order"
                          status={order.status?.orderStatus || "Pending"}
                        />
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link
                          to={`/orders/${targetId}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-(--admin-border) bg-(--admin-bg) px-3 py-1.5 text-xs font-semibold text-(--admin-text) transition-colors hover:border-(--admin-brand) hover:bg-(--admin-brand) hover:text-white"
                        >
                          <Eye size={14} /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalOrders > 0 && (
  <div className="flex flex-col items-center justify-between gap-3 border-t border-(--admin-border) bg-(--admin-surface) px-6 py-3.5 text-sm sm:flex-row">
    <p className="text-xs text-(--admin-muted)">
      Showing{" "}
      <span className="font-semibold text-(--admin-text)">
        {rangeStart}–{rangeEnd}
      </span>{" "}
      of{" "}
      <span className="font-semibold text-(--admin-text)">
        {totalOrders}
      </span>{" "}
      orders
    </p>

    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        className="inline-flex items-center gap-1 rounded-lg border border-(--admin-border) bg-(--admin-bg) px-3 py-1.5 text-xs font-semibold text-(--admin-text) transition-colors hover:bg-(--admin-hover) disabled:cursor-not-allowed disabled:opacity-45"
      >
        <ChevronLeft size={14} /> Previous
      </button>

      <span className="px-2 text-xs font-medium text-(--admin-muted)">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        className="inline-flex items-center gap-1 rounded-lg border border-(--admin-border) bg-(--admin-bg) px-3 py-1.5 text-xs font-semibold text-(--admin-text) transition-colors hover:bg-(--admin-hover) disabled:cursor-not-allowed disabled:opacity-45"
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  </div>
)}
      </div>
    </div>
  );
}