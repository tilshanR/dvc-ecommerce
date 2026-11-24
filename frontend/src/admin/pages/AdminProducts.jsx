import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Package, Archive, FileText } from "lucide-react";
import ProductFilters from "../features/products/ProductFilters";
import ProductTable from "../features/products/ProductTable";
import ProductForm from "../features/products/ProductForm";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  archiveProduct,
  restoreProduct,
} from "../services/adminProductApi";
import AdminCard from "../components/ui/AdminCard";
import { getAdminCategories } from "../services/adminCategoryApi";

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notice, setNotice] = useState("");
  const [categories, setCategories] = useState([]);

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

  //fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getAdminCategories();
        setCategories(result);
      } catch (err) {
        setError(err.message || "Failed to load categories.");
      }
    };

    fetchCategories();
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
    // Strip out read-only / database-managed fields to prevent Zod strict validation errors
    const {
      _id,
      slug,
      mainImage,
      availableStock,
      stock,
      averageRating,
      reviewCount,
      createdAt,
      updatedAt,
      ...editableProduct
    } = product;

    //   _id is separately  handled by handleSave,
    //  passes only the clean editable fields + original _id reference for updating.
    setSelectedProduct({ ...editableProduct, _id: product._id });
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedProduct) {
        // Do NOT destructure or spread formData.
        // Pass the raw FormData object directly to the update function.
        const result = await updateProduct(selectedProduct._id, formData);

        setProducts((prev) =>
          prev.map((product) =>
            product._id === selectedProduct._id ? result.product : product,
          ),
        );

        setNotice(result.message);
      } else {
        // For creation, just send formData normally
        const result = await createProduct(formData);

        setProducts((prev) => [result.product, ...prev]);

        setNotice(result.message);
      }

      setShowForm(false);
      setSelectedProduct(null);
    } catch (error) {
      throw error;
    }
  };

  const handleArchive = async (id) => {
    try {
      const result = await archiveProduct(id);

      setProducts((prev) =>
        prev.map((product) => (product._id === id ? result.product : product)),
      );

      setNotice(result.message);
    } catch (err) {
      setError(err.message || "Failed to archive product.");
    }
  };

  const handleRestore = async (id) => {
    try {
      const result = await restoreProduct(id);

      setProducts((prev) =>
        prev.map((product) => (product._id === id ? result.product : product)),
      );

      setNotice(result.message);
    } catch (err) {
      setError(err.message || "Failed to restore product.");
    }
  };
  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--admin-brand) px-4 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-(--admin-brand-hover)"
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

      {notice && (
        <div className="flex items-center justify-between rounded-xl border border-(--admin-status-success-border) bg-(--admin-status-success-bg) p-3.5 text-sm text-(--admin-status-success-text)">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
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
      {isLoading ? (
        <div className="rounded-xl border border-(--admin-border) bg-(--admin-surface) p-8 text-center text-sm text-(--admin-muted)">
          Loading products...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) p-4 text-sm text-(--admin-status-danger-text)"
        >
          {error}
        </div>
      ) : (
        <ProductTable
          products={filteredProducts}
          onView={(product) => navigate(`/products/${product._id}`)}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onRestore={handleRestore}
        />
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <ProductForm
          product={selectedProduct}
          categories={categories}
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
        <p className="text-sm text-(--admin-muted)">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-(--admin-text)">
          {count}
        </p>
      </div>

      <div className="rounded-lg bg-(--admin-brand-soft) p-3 text-(--admin-brand-text)">
        {icon}
      </div>
    </AdminCard>
  );
}
