import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, Package, AlertCircle } from "lucide-react";
import { getAdminOrders } from "../services/adminOrderApi";
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

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const params = { page, limit: 10 };
      if (statusFilter !== "All") params.orderStatus = statusFilter;

      const response = await getAdminOrders(params);

      // Strict array extraction to prevent .map() errors
      let extractedOrders = [];
      if (Array.isArray(response.data)) {
        extractedOrders = response.data;
      } else if (Array.isArray(response.data?.orders)) {
        extractedOrders = response.data.orders;
      } else if (Array.isArray(response.orders)) {
        extractedOrders = response.orders;
      }

      setOrders(extractedOrders);

      // Strict pagination extraction
      const paginationData =
        response.pagination || response.data?.pagination || {};
      setTotalPages(paginationData.totalPages || 1);
      setTotalOrders(paginationData.total || extractedOrders.length);
    } catch (err) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
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

    return `px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || "bg-gray-100 text-gray-800 border-gray-200"}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Order Management"
          description={`View and manage ${totalOrders} customer orders.`}
        />
        <div className="relative w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={handleFilterChange}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-[#183D3D] focus:outline-none focus:ring-1 focus:ring-[#183D3D]"
          >
            <option value="All">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  Fulfillment
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    <div className="mb-2 flex justify-center">
                      <Package
                        className="animate-pulse text-gray-400"
                        size={32}
                      />
                    </div>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-[#183D3D]">
                      {order.orderNumber}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        {order.methods?.checkoutMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatLKR(order.financials?.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={getStatusBadge(order.status?.paymentStatus)}
                      >
                        {order.status?.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={getStatusBadge(order.status?.orderStatus)}
                      >
                        {order.status?.orderStatus || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/orders/${order.id || order._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900"
                      >
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
