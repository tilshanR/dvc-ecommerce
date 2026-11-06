
import { Pencil, Archive, RotateCcw } from "lucide-react";

export default function ProductTable({
  products = [],
  onEdit,
  onArchive,
  onRestore,
}) {
  const formatPrice = (price) =>
    `Rs. ${Number(price || 0).toLocaleString("en-LK")}`;

  if (products.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-4">Product</th>
            <th className="p-4">Category</th>
            <th className="p-4">Price</th>
            <th className="p-4">Stock</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-gray-50">
              <td className="p-4">
                <p className="font-medium text-gray-800">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500">
                  SKU: {product.sku || "N/A"}
                </p>
              </td>

              <td className="p-4 text-gray-600">
                {product.category?.name || "N/A"}
              </td>

              <td className="p-4 font-medium">
                {formatPrice(product.price)}
              </td>

              <td className="p-4">
                {product.availableStock ?? 0}
              </td>

              <td className="p-4">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize">
                  {product.status || "Unknown"}
                </span>
              </td>

              <td className="p-4">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => onEdit?.(product)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit product"
                  >
                    <Pencil size={17} />
                  </button>

                  {product.status === "archived" ? (
                    <button
                      onClick={() => onRestore?.(product._id)}
                      className="text-green-600 hover:text-green-800"
                      title="Restore product"
                    >
                      <RotateCcw size={17} />
                    </button>
                  ) : (
                    <button
                      onClick={() => onArchive?.(product._id)}
                      className="text-red-500 hover:text-red-700"
                      title="Archive product"
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
