import { useEffect, useMemo, useState } from "react";
import { Plus, Package, Archive, FileText } from "lucide-react";
import ProductFilters from "../features/products/ProductFilters";
import ProductTable from "../features/products/ProductTable";
import ProductForm from "../features/products/ProductForm";
import { getAdminProducts } from "../services/adminProductApi";
import AdminCard from "../components/ui/AdminCard";
const mockCategories = [
  { _id: "mock-smartphones", name: "Smartphones" },
  { _id: "mock-ram", name: "RAM" },
  { _id: "mock-notebooks", name: "Notebooks" },
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const result = await getAdminProducts();

        setProducts(result.products);
      } catch (err) {
        setError(err.message || "Failed to load products.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.sku || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus = !status || product.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [products, search, status]);

  const counts = {
    active: products.filter((p) => p.status === "active").length,
    draft: products.filter((p) => p.status === "draft").length,
    archived: products.filter((p) => p.status === "archived").length,
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    if (selectedProduct) {
      setProducts((prev) =>
        prev.map((product) =>
          product._id === selectedProduct._id
            ? {
                ...product,
                ...formData,
                category:
                  mockCategories.find(
                    (category) => category._id === formData.category,
                  ) || null,
                availableStock:
                  formData.inventory.onHand - formData.inventory.reserved,
              }
            : product,
        ),
      );

      setNotice("Product updated successfully.");
    } else {
      const newProduct = {
        ...formData,
        _id: `mock-${Date.now()}`,
        category:
          mockCategories.find(
            (category) => category._id === formData.category,
          ) || null,
        availableStock: formData.inventory.onHand - formData.inventory.reserved,
      };

      setProducts((prev) => [newProduct, ...prev]);
      setNotice("Product created successfully.");
    }

    setShowForm(false);
    setSelectedProduct(null);
  };

  const handleArchive = (id) => {
    setProducts((prev) =>
      prev.map((product) =>
        product._id === id ? { ...product, status: "archived" } : product,
      ),
    );

    setNotice("Product archived.");
  };

  const handleRestore = (id) => {
    setProducts((prev) =>
      prev.map((product) =>
        product._id === id ? { ...product, status: "draft" } : product,
      ),
    );

    setNotice("Product restored as draft.");
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#183D3D]">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your store products.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#183D3D] px-4 py-2.5 text-sm text-white hover:bg-[#245454]"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Active Products"
          count={counts.active}
          icon={<Package size={20} />}
        />

        <SummaryCard
          title="Draft Products"
          count={counts.draft}
          icon={<FileText size={20} />}
        />

        <SummaryCard
          title="Archived Products"
          count={counts.archived}
          icon={<Archive size={20} />}
        />
      </div>

      {/* Notice */}
      {notice && (
        <div className="flex items-center justify-between rounded-lg bg-[#E8F0EF] p-3 text-sm text-[#183D3D]">
          {notice}
          <button onClick={() => setNotice("")}>Dismiss</button>
        </div>
      )}

      {/* Filters */}
      <ProductFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        onClear={handleClearFilters}
      />

      {/* Product table */}
      {/* Product table */}
      {isLoading ? (
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
          Loading products...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <ProductTable
          products={filteredProducts}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onRestore={handleRestore}
        />
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <ProductForm
          product={selectedProduct}
          categories={mockCategories}
          brands={[]}
          onSubmit={handleSave}
          onClose={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

function SummaryCard({ title, count, icon }) {
  return (
    <AdminCard className="flex items-center justify-between">
      <div>
        <p className="admin-muted text-sm">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--admin-text)">
          {count}
        </p>
      </div>

      <div className="rounded-lg bg-(--admin-hover) p-3 text-(--admin-text)">
        {icon}
      </div>
    </AdminCard>
  );
}
