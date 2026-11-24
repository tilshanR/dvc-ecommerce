import {
  AlertCircle,
  ArrowRight,
  Banknote,
  ClipboardList,
  CreditCard,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  Tags,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StatCard from "../components/ui/StatCard";

import AdminCard from "../components/ui/AdminCard";
import RecentOrdersCard from "../components/dashboard/RecentOrdersCard";
import {
  InventoryAttentionCard,
  StatusBreakdownCard,
} from "../components/dashboard/OperationalPanels";
import useAdminDashboardData, {
  LOW_STOCK_THRESHOLD,
} from "../hooks/useAdminDashboardData";

const lkrFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  minimumFractionDigits: 2,
});

function formatUpdatedTime(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-LK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    metrics,
    orderStatusCounts,
    paymentStatusCounts,
    recentOrders,
    attentionProducts,
    loading,
    refreshing,
    errors,
    lastUpdated,
    refresh,
  } = useAdminDashboardData();

  const kpiCards = [
    {
      title: "Paid Revenue",
      value: lkrFormatter.format(metrics.paidRevenue),
      icon: Banknote,
      description: `Across ${metrics.totalOrders} total order${
        metrics.totalOrders === 1 ? "" : "s"
      }`,
      tone: "brand",
      onClick: () => navigate("/orders"),
    },
    {
      title: "Orders Needing Action",
      value: String(metrics.ordersNeedingAction),
      icon: ClipboardList,
      description:
        metrics.ordersNeedingAction > 0
          ? "Pending, processing, or ready for pickup"
          : "All orders caught up",
      tone: metrics.ordersNeedingAction > 0 ? "warning" : "success",
      onClick: () => navigate("/orders"),
    },
    {
      title: "Payment Exceptions",
      value: String(metrics.paymentExceptions),
      icon: CreditCard,
      description:
        metrics.paymentExceptions > 0
          ? "Failed or pending online payments"
          : "No payment issues detected",
      tone: metrics.paymentExceptions > 0 ? "danger" : "success",
      onClick: () => navigate("/orders"),
    },
    {
      title: "Active Catalog",
      value: String(metrics.activeProducts),
      icon: Package,
      description: `${metrics.totalProducts} products · ${metrics.totalCategories} categories`,
      tone: "info",
      onClick: () => navigate("/products"),
    },
  ];

  const quickActions = [
    {
      label: "Manage Orders",
      detail: "Review fulfillment & payment statuses",
      icon: ShoppingCart,
      path: "/orders",
    },
    {
      label: "Add / Manage Products",
      detail: "Update inventory and product listings",
      icon: Plus,
      path: "/products",
    },
    {
      label: "Manage Categories",
      detail: "Organize your store catalogue",
      icon: Tags,
      path: "/categories",
    },
  ];

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
        {lastUpdated && !loading && (
          <span className="text-xs text-(--admin-muted)">
            Updated {formatUpdatedTime(lastUpdated)}
          </span>
        )}

        <button
          type="button"
          onClick={refresh}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-(--admin-border) bg-(--admin-surface) px-3.5 py-2 text-xs font-medium text-(--admin-text) transition hover:border-(--admin-brand) hover:bg-(--admin-brand-soft) hover:text-(--admin-brand-text) disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Partial / Full Error Recovery Banner */}
      {errors.length > 0 && (
        <div
          role="alert"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) px-4 py-3 text-(--admin-status-danger-text)"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold">
                Some dashboard data could not load
              </p>
              <p className="mt-0.5 opacity-90">
                {errors
                  .map((err) => `${err.source}: ${err.message}`)
                  .join(" · ")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-(--admin-status-danger-border) px-3 py-1.5 text-xs font-semibold transition hover:bg-(--admin-surface)/20"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Summary Grid */}
      <section className="mb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              description={card.description}
              tone={card.tone}
              loading={loading}
              onClick={card.onClick}
            />
          ))}
        </div>
      </section>

      {/* Operational Workspace: Primary Workstream (Left) + Immediate Attention Rail (Right) */}
      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        {/* Left 8 Columns: Recent Orders + Compact Order/Payment Breakdown */}
        <div className="space-y-6 xl:col-span-8">
          <RecentOrdersCard
            orders={recentOrders}
            loading={loading}
            onViewAll={() => navigate("/orders")}
            onSelectOrder={(orderId) => navigate(`/orders/${orderId}`)}
          />

          <StatusBreakdownCard
            orderStatusCounts={orderStatusCounts}
            paymentStatusCounts={paymentStatusCounts}
            loading={loading}
          />
        </div>

        {/* Right 4 Columns: Inventory Attention Above the Fold + Quick Actions */}
        <div className="space-y-6 xl:col-span-4">
          <InventoryAttentionCard
            products={attentionProducts}
            lowStockThreshold={LOW_STOCK_THRESHOLD}
            loading={loading}
            onManageProducts={() => navigate("/products")}
            onSelectProduct={(product) => navigate(`/products/${product._id}`)}
          />

          <AdminCard>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-(--admin-text)">
                Quick Actions
              </h2>
              <p className="mt-1 text-sm text-(--admin-muted)">
                Common store management tasks.
              </p>
            </div>

            <div className="space-y-2.5">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => navigate(action.path)}
                    className="flex w-full items-center justify-between rounded-lg border border-(--admin-border) p-3 text-left transition hover:border-(--admin-brand) hover:bg-(--admin-brand-soft)"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--admin-brand-soft) text-(--admin-brand-text)">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-(--admin-text)">
                          {action.label}
                        </p>
                        <p className="mt-0.5 text-xs text-(--admin-muted)">
                          {action.detail}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-(--admin-muted)" />
                  </button>
                );
              })}
            </div>
          </AdminCard>
        </div>
      </section>
    </>
  );
}
