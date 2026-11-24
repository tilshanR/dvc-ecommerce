import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const TONE_ICON_STYLES = {
  brand: "bg-(--admin-brand-soft) text-(--admin-brand-text)",
  success: "bg-(--admin-status-success-bg) text-(--admin-status-success-text)",
  warning: "bg-(--admin-status-warning-bg) text-(--admin-status-warning-text)",
  danger: "bg-(--admin-status-danger-bg) text-(--admin-status-danger-text)",
  info: "bg-(--admin-status-info-bg) text-(--admin-status-info-text)",
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel = "from last month",
  trendDirection = "up",
  tone = "brand",
  loading = false,
  onClick,
}) {
  const isPositive = trendDirection === "up";
  const iconToneClass = TONE_ICON_STYLES[tone] || TONE_ICON_STYLES.brand;
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`w-full rounded-xl border border-(--admin-border) bg-(--admin-surface) p-5 text-left text-(--admin-text) shadow-xs transition ${
        onClick
          ? "cursor-pointer hover:border-(--admin-brand) hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-(--admin-brand)"
          : "hover:shadow-sm"
      }`}
    >
      {/* Card heading */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-(--admin-muted)">{title}</p>

          {loading ? (
            <div className="mt-2.5 h-8 w-24 animate-pulse rounded-md bg-(--admin-hover)" />
          ) : (
            <h2 className="mt-2 truncate text-2xl font-bold tracking-tight text-(--admin-text)">
              {value}
            </h2>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconToneClass}`}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      {/* Description or trend */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {loading ? (
          <div className="h-4 w-36 animate-pulse rounded bg-(--admin-hover)" />
        ) : (
          <>
            {trend !== undefined && trend !== null && (
              <span
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${
                  isPositive
                    ? "border-(--admin-status-success-border) bg-(--admin-status-success-bg) text-(--admin-status-success-text)"
                    : "border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) text-(--admin-status-danger-text)"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}

                {trend}
              </span>
            )}

            <span className="text-xs text-(--admin-muted)">
              {description || trendLabel}
            </span>
          </>
        )}
      </div>
    </Wrapper>
  );
}
