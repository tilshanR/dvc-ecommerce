import { Eye, Pencil, Archive, RotateCcw, Package } from "lucide-react";
import StatusBadge from "../../components/ui/StatusBadge";

const LOW_STOCK_THRESHOLD = 5;

function StockIndicator({ availableStock = 0 }) {
  const stock = Number(availableStock ?? 0);

  if (stock === 0) {
    return (
      <span className="inline-flex items-center rounded-full border border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) px-2.5 py-0.5 text-xs font-semibold text-(--admin-status-danger-text)">
        Out of stock (0)
      </span>
    );
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return (
      <span className="inline-flex items-center rounded-full border border-(--admin-status-warning-border) bg-(--admin-status-warning-bg) px-2.5 py-0.5 text-xs font-semibold text-(--admin-status-warning-text)">
        Low ({stock})
      </span>
    );
  }

  return (
    <span className="font-medium text-(--admin-text)">{stock} in stock</span>
  );
}

export default function ProductTable({
  products = [],
  onView,
  onEdit,
  onArchive,
  onRestore,
}) {
  const formatPrice = (price) =>
    `LKR ${Number(price || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-(--admin-border) bg-(--admin-surface) p-10 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-(--admin-brand-soft) text-(--admin-brand-text)">
          <Package size={20} />
        </div>
        <p className="mt-3 text-sm font-semibold text-(--admin-text)">
          No matching products
        </p>
        <p className="mt-1 text-xs text-(--admin-muted)">
          Adjust your search or status filter, or add a new product to your
          catalogue.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-(--admin-border) bg-(--admin-surface) shadow-xs">
      <table className="w-full min-w-190 text-left text-sm">
        <thead className="border-b border-(--admin-border) bg-(--admin-hover)/60 text-xs font-semibold uppercase tracking-wider text-(--admin-muted)">
          <tr>
            <th className="px-4 py-3.5">Product</th>
            <th className="px-4 py-3.5">Category</th>
            <th className="px-4 py-3.5">Price</th>
            <th className="px-4 py-3.5">Sellable Stock</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-(--admin-border)">
          {products.map((product) => (
            <tr
              key={product._id}
              onClick={() => onView?.(product)}
              className={`transition-colors hover:bg-(--admin-hover) ${
                onView ? "cursor-pointer" : ""
              }`}
            >
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  {product.mainImage ? (
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="h-10 w-10 shrink-0 rounded-lg border border-(--admin-border) object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-(--admin-border) bg-(--admin-hover) text-(--admin-muted)">
                      <Package size={16} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-medium text-(--admin-text)">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-xs text-(--admin-muted)">
                      SKU: {product.sku || "N/A"}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3.5 text-(--admin-muted)">
                {product.category?.name || "N/A"}
              </td>

              <td className="px-4 py-3.5 font-medium whitespace-nowrap text-(--admin-text)">
                {formatPrice(product.price)}
              </td>

              <td className="px-4 py-3.5 whitespace-nowrap">
                <StockIndicator availableStock={product.availableStock} />
              </td>

              <td className="px-4 py-3.5">
                <StatusBadge status={product.status} type="product" />
              </td>

              <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1.5">
                  {onView && (
                    <button
                      type="button"
                      onClick={() => onView(product)}
                      className="rounded-lg p-1.5 text-(--admin-muted) transition hover:bg-(--admin-brand-soft) hover:text-(--admin-brand-text)"
                      title="View product details"
                      aria-label={`View ${product.name}`}
                    >
                      <Eye size={17} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onEdit?.(product)}
                    className="rounded-lg p-1.5 text-(--admin-status-info-text) transition hover:bg-(--admin-status-info-bg)"
                    title="Edit product"
                    aria-label={`Edit ${product.name}`}
                  >
                    <Pencil size={17} />
                  </button>

                  {product.status === "archived" ? (
                    <button
                      type="button"
                      onClick={() => onRestore?.(product._id)}
                      className="rounded-lg p-1.5 text-(--admin-status-success-text) transition hover:bg-(--admin-status-success-bg)"
                      title="Restore product"
                      aria-label={`Restore ${product.name}`}
                    >
                      <RotateCcw size={17} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onArchive?.(product._id)}
                      className="rounded-lg p-1.5 text-(--admin-status-danger-text) transition hover:bg-(--admin-status-danger-bg)"
                      title="Archive product"
                      aria-label={`Archive ${product.name}`}
                    >
                      <Archive size={17} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
