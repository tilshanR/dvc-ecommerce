
import { ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actionLabel,
  onAction,
  actionLink,
}) {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex flex-wrap items-center gap-2 text-sm"
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <div
                key={`${item.label}-${index}`}
                className="flex items-center gap-2"
              >
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="text-gray-500 transition hover:text-[#183D3D]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={
                      isLast
                        ? "font-medium text-[#183D3D]"
                        : "text-gray-500"
                    }
                  >
                    {item.label}
                  </span>
                )}

                {!isLast && (
                  <ChevronRight size={15} className="text-gray-400" />
                )}
              </div>
            );
          })}
        </nav>
      )}

      {/* Page heading and action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>

        {actionLabel && (
          actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#183D3D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245454]"
            >
              <Plus size={18} />
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#183D3D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245454]"
            >
              <Plus size={18} />
              {actionLabel}
            </button>
          )
        )}
      </div>
    </div>
  );
}
