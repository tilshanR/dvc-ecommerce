
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Package,
  Pencil,
  Archive,
  RotateCcw,
} from "lucide-react";

const initialProducts = [
  {
    id: "1",
    name: "Samsung Galaxy A55",
    sku: "MOB-SAM-001",
    category: "Mobile Phones",
    subcategory: "Android Phones",
    price: 85000,
    stock: 12,
    status: "active",
  },
  {
    id: "2",
    name: "iPhone 15",
    sku: "MOB-APP-001",
    category: "Mobile Phones",
    subcategory: "iPhones",
    price: 245000,
    stock: 5,
    status: "active",
  },
  {
    id: "3",
    name: "Kingston 16GB DDR4 RAM",
    sku: "COM-RAM-001",
    category: "Computer Parts",
    subcategory: "RAM",
    price: 12500,
    stock: 0,
    status: "active",
  },
  {
    id: "4",
    name: "Notebook A5",
    sku: "STA-NOT-001",
    category: "Stationery",
    subcategory: "Notebooks",
    price: 450,
    stock: 35,
    status: "active",
  },
  {
    id: "5",
    name: "Sample Draft Product",
    sku: "DRAFT-001",
    category: "Computer Parts",
    subcategory: "RAM",
    price: 5000,
    stock: 8,
    status: "draft",
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price);

function StatusBadge({ status }) {
  const styles = {
    active: "bg-green-100 text-green-700",
    draft: "bg-yellow-100 text-yellow-700",
    archived: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        styles[status] || styles.draft
      }`}
    >
      {status}
    </span>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

  const activeCount = products.filter(
    (product) => product.status === "active"
  ).length;

  const draftCount = products.filter(
    (product) => product.status === "draft"
  ).length;

  const archivedCount = products.filter(
    (product) => product.status === "archived"
  ).length;

  const handleArchive = (productId) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? { ...product, status: "archived" }
          : product
      )
    );
    setNotice("Product archived successfully.");
  };

  const handleRestore = (productId) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? { ...product, status: "active" }
          : product
      )
    );
    setNotice("Product restored successfully.");
  };

  const handleAddProduct = () => {
    setNotice("Product creation will be added in the next milestone.");
  };

  const handleEditProduct = () => {
    setNotice("Product editing will be added in a later milestone.");
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Products
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your store products and inventory.
          </p>
        </div>

        <button
          onClick={handleAddProduct}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#183D3D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#245454]"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Active Products"
          count={activeCount}
          icon={<Package size={20} />}
        />
        <SummaryCard
          label="Draft Products"
          count={draftCount}
          icon={<Pencil size={20} />}
        />
        <SummaryCard
          label="Archived Products"
          count={archivedCount}
          icon={<Archive size={20} />}
        />
      </div>

      {/* Feedback message */}
      {notice && (
        <div className="flex items-center justify-between rounded-lg border border-[#D5E5E2] bg-[#E8F0EF] px-4 py-3 text-sm text-[#183D3D]">
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            className="font-medium hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#183D3D]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#183D3D]"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Products table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">SKU</th>
                <th className="px-5 py-4 font-medium">Category</th>
                <th className="px-5 py-4 font-medium">Price</th>
                <th className="px-5 py-4 font-medium">Stock</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-900">
                        {product.name}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {product.sku}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-800">
                        {product.subcategory}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {product.category}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-800">
                      {formatPrice(product.price)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          product.stock === 0
                            ? "font-medium text-red-600"
                            : "text-gray-700"
                        }
                      >
                        {product.stock}
                      </span>
                      {product.stock === 0 && (
                        <span className="ml-2 text-xs text-red-500">
                          Out of stock
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={product.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={handleEditProduct}
                          title="Edit product"
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-[#183D3D]"
                        >
                          <Pencil size={17} />
                        </button>

                        {product.status === "archived" ? (
                          <button
                            onClick={() => handleRestore(product.id)}
                            title="Restore product"
                            className="rounded-lg p-2 text-gray-500 hover:bg-green-50 hover:text-green-700"
                          >
                            <RotateCcw size={17} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchive(product.id)}
                            title="Archive product"
                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Archive size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No products found. Try changing your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, count, icon }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#E8F0EF] text-[#183D3D]">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">
          {count}
        </p>
      </div>
    </div>
  );
}
