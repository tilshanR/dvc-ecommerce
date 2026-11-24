import { ArrowRight, ShoppingBag } from "lucide-react";
import AdminCard from "../ui/AdminCard";
import StatusBadge from "../ui/StatusBadge";

const lkrFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  minimumFractionDigits: 2,
});

function formatOrderDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-LK", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function OrdersSkeleton() {
  return (
    <div className="divide-y divide-(--admin-border)">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4 py-3.5"
        >
          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-(--admin-hover)" />
            <div className="h-3 w-40 animate-pulse rounded bg-(--admin-hover)" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-20 animate-pulse rounded-full bg-(--admin-hover)" />
            <div className="h-4 w-24 animate-pulse rounded bg-(--admin-hover)" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RecentOrdersCard({
  orders = [],
  loading = false,
  onViewAll = () => {},
  onSelectOrder = () => {},
  className = "",
}) {
  return (
    <AdminCard className={className}>
      {/* Card Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-(--admin-text)">
            Recent Orders
          </h2>
          <p className="mt-1 text-sm text-(--admin-muted)">
            Latest customer orders and PayHere payment statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 rounded-lg border border-(--admin-border) px-3 py-1.5 text-xs font-medium text-(--admin-brand-text) transition hover:bg-(--admin-brand-soft)"
        >
          View all orders
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Body: Loading / Empty / Table */}
      {loading ? (
        <OrdersSkeleton />
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-(--admin-border) px-4 py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-(--admin-brand-soft) text-(--admin-brand-text)">
            <ShoppingBag size={20} />
          </div>
          <p className="mt-3 text-sm font-semibold text-(--admin-text)">
            No orders yet
          </p>
          <p className="mt-1 max-w-sm text-xs text-(--admin-muted)">
            New customer orders and online payment updates will appear here
            automatically.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-150 border-collapse text-left">
            <thead>
              <tr className="border-b border-(--admin-border) text-xs font-semibold uppercase tracking-wider text-(--admin-muted)">
                <th className="pb-3 pr-4">Order</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Payment</th>
                <th className="pb-3 pr-4">Fulfillment</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-(--admin-border) text-sm">
              {orders.map((order) => {
                const customerName = `${order.customer?.firstName || ""} ${
                  order.customer?.lastName || ""
                }`.trim();

                return (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order.id)}
                    className="cursor-pointer transition hover:bg-(--admin-hover)"
                  >
                    <td className="py-3.5 pr-4 align-middle">
                      <p className="font-semibold text-(--admin-brand-text)">
                        {order.orderNumber}
                      </p>
                      <p className="mt-0.5 text-xs text-(--admin-muted)">
                        {formatOrderDate(order.createdAt)}
                      </p>
                    </td>

                    <td className="py-3.5 pr-4 align-middle">
                      <p className="font-medium text-(--admin-text)">
                        {customerName || "Guest Customer"}
                      </p>
                      <p className="mt-0.5 text-xs text-(--admin-muted)">
                        {order.methods?.paymentMethod || "—"}
                      </p>
                    </td>

                    <td className="py-3.5 pr-4 align-middle">
                      <StatusBadge
                        status={order.status?.paymentStatus}
                        type="payment"
                      />
                    </td>

                    <td className="py-3.5 pr-4 align-middle">
                      <StatusBadge
                        status={order.status?.orderStatus}
                        type="order"
                      />
                    </td>

                    <td className="py-3.5 text-right align-middle font-semibold whitespace-nowrap text-(--admin-text)">
                      {lkrFormatter.format(Number(order.financials?.total) || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminCard>
  );
}