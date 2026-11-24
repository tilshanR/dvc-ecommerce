import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import AdminCard from "../ui/AdminCard";

const PAYMENT_BAR_CONFIG = [
  { key: "Paid", color: "bg-(--admin-status-success-text)" },
  { key: "Pending", color: "bg-(--admin-status-warning-text)" },
  { key: "Failed", color: "bg-(--admin-status-danger-text)" },
  { key: "Refunded", color: "bg-(--admin-status-neutral-text)" },
];

const ORDER_BAR_CONFIG = [
  { key: "Pending", color: "bg-(--admin-status-warning-text)" },
  { key: "Processing", color: "bg-(--admin-status-info-text)" },
  { key: "Ready for Pickup", color: "bg-(--admin-status-warning-text)" },
  { key: "Shipped", color: "bg-(--admin-status-info-text)" },
  { key: "Delivered", color: "bg-(--admin-status-success-text)" },
  { key: "Cancelled", color: "bg-(--admin-status-danger-text)" },
];

function BreakdownRows({ items, counts, total }) {
  return (
    <div className="space-y-3">
      {items.map(({ key, color }) => {
        const count = counts?.[key] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-(--admin-text)">{key}</span>
              <span className="text-(--admin-muted)">
                {count} ({pct}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-(--admin-hover)">
              <div
                className={`h-full rounded-full transition-all duration-300 ${color}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StatusBreakdownCard({
  orderStatusCounts = {},
  paymentStatusCounts = {},
  loading = false,
}) {
  const orderTotal = Object.values(orderStatusCounts).reduce(
    (sum, n) => sum + n,
    0,
  );
  const paymentTotal = Object.values(paymentStatusCounts).reduce(
    (sum, n) => sum + n,
    0,
  );

  return (
    <AdminCard>
      <div className="mb-5 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-(--admin-text)">
            Order & Payment Health
          </h2>
          <p className="mt-1 text-sm text-(--admin-muted)">
            Live distribution across current orders.
          </p>
        </div>
        <CreditCard className="h-5 w-5 shrink-0 text-(--admin-muted)" />
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-32 animate-pulse rounded bg-(--admin-hover)" />
              <div className="h-2 w-full animate-pulse rounded-full bg-(--admin-hover)" />
            </div>
          ))}
        </div>
      ) : orderTotal === 0 ? (
        <p className="rounded-xl border border-dashed border-(--admin-border) px-4 py-8 text-center text-xs text-(--admin-muted)">
          Status breakdowns will appear once orders are recorded.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-(--admin-muted)">
              Payment Status
            </p>
            <BreakdownRows
              items={PAYMENT_BAR_CONFIG}
              counts={paymentStatusCounts}
              total={paymentTotal}
            />
          </div>

          <div className="border-t border-(--admin-border) pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-(--admin-muted)">
              Fulfillment Status
            </p>
            <BreakdownRows
              items={ORDER_BAR_CONFIG}
              counts={orderStatusCounts}
              total={orderTotal}
            />
          </div>
        </div>
      )}
    </AdminCard>
  );
}

export function InventoryAttentionCard({
  products = [],
  lowStockThreshold = 5,
  loading = false,
  onManageProducts = () => {},
  onSelectProduct = () => {},
}) {
  return (
    <AdminCard>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-(--admin-text)">
            Inventory Attention
          </h2>
          <p className="mt-1 text-sm text-(--admin-muted)">
            Active products at or below {lowStockThreshold} sellable units.
          </p>
        </div>

        <button
          type="button"
          onClick={onManageProducts}
          className="inline-flex items-center gap-1.5 rounded-lg border border-(--admin-border) px-3 py-1.5 text-xs font-medium text-(--admin-brand-text) transition hover:bg-(--admin-brand-soft)"
        >
          Manage products
          <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 py-2"
            >
              <div className="h-4 w-44 animate-pulse rounded bg-(--admin-hover)" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-(--admin-hover)" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-(--admin-status-success-border) bg-(--admin-status-success-bg) p-4 text-(--admin-status-success-text)">
          <CheckCircle2 size={18} className="shrink-0" />
          <p className="text-xs font-medium">
            All active products are above the low-stock threshold.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-(--admin-border)">
          {products.map((product) => {
            const stock = Number(product.availableStock ?? product.stock ?? 0);
            const isOut = stock === 0;

            return (
              <button
                key={product._id}
                type="button"
                onClick={() => onSelectProduct(product)}
                title={`Manage ${product.name}`}
                className="group -mx-2 flex w-[calc(100%+1rem)] cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-3 text-left transition hover:bg-(--admin-hover) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--admin-brand)"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-(--admin-text) transition-colors group-hover:text-(--admin-brand-text)">
                    {product.name}
                  </p>
                  {product.sku && (
                    <p className="mt-0.5 text-xs text-(--admin-muted)">
                      SKU: {product.sku}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      isOut
                        ? "border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) text-(--admin-status-danger-text)"
                        : "border-(--admin-status-warning-border) bg-(--admin-status-warning-bg) text-(--admin-status-warning-text)"
                    }`}
                  >
                    <AlertTriangle size={12} />
                    {isOut ? "Out of stock" : `${stock} left`}
                  </span>

                  <ChevronRight
                    size={16}
                    className="text-(--admin-muted) transition-transform group-hover:translate-x-0.5 group-hover:text-(--admin-brand-text)"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </AdminCard>
  );
}
