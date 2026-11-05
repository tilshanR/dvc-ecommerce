
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel = "from last month",
  trendDirection = "up",
}) {
  const isPositive = trendDirection === "up";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Card heading */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {value}
          </h2>
        </div>

        {/* Icon */}
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F0EF] text-[#183D3D]">
            <Icon size={22} />
          </div>
        )}
      </div>

      {/* Description or trend */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {trend !== undefined && trend !== null && (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
              isPositive
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
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

        <span className="text-xs text-gray-500">
          {description || trendLabel}
        </span>
      </div>
    </div>
  );
}
