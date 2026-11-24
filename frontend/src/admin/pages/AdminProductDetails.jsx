import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Layers,
  Package,
  Pencil,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Tag,
} from "lucide-react";

import {
  archiveProduct,
  getAdminProductById,
  restoreProduct,
  updateProduct,
} from "../services/adminProductApi";
import { getAdminCategories } from "../services/adminCategoryApi";
import AdminCard from "../components/ui/AdminCard";
import StatusBadge from "../components/ui/StatusBadge";
import ProductForm from "../features/products/ProductForm";

const LOW_STOCK_THRESHOLD = 5;

function formatLkr(amount) {
  if (amount === null || amount === undefined) return "—";
  return `LKR ${Number(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateTime(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatAttributeLabel(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase())
    .trim();
}

function formatAttributeValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatWarranty(warranty) {
  if (!warranty || warranty.type === "none") {
    return "No warranty";
  }
  const typeLabel =
    warranty.type === "manufacturer"
      ? "Manufacturer Warranty"
      : "Checking Warranty";

  if (warranty.duration && warranty.unit) {
    return `${typeLabel} (${warranty.duration} ${warranty.unit})`;
  }
  return typeLabel;
}

export default function AdminProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editableProduct, setEditableProduct] = useState(null);

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [fetchedProduct, fetchedCategories] = await Promise.all([
        getAdminProductById(productId),
        getAdminCategories().catch(() => []),
      ]);

      setProduct(fetchedProduct);
      if (Array.isArray(fetchedCategories)) {
        setCategories(fetchedCategories);
      }
    } catch (err) {
      setError(err.message || "Failed to load product details.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleOpenEdit = () => {
    if (!product) return;

    // Strip read-only / virtual database fields to satisfy backend Zod .strict()
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
      ...cleanProduct
    } = product;

    setEditableProduct({ ...cleanProduct, _id: product._id });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (formData) => {
    const result = await updateProduct(product._id, formData);
    setProduct(result.product);
    setNotice(result.message || "Product updated successfully.");
    setShowEditModal(false);
    setEditableProduct(null);
  };

  const handleArchiveToggle = async () => {
    if (!product || actionLoading) return;

    try {
      setActionLoading(true);
      setError("");

      const result =
        product.status === "archived"
          ? await restoreProduct(product._id)
          : await archiveProduct(product._id);

      setProduct(result.product);
      setNotice(result.message);
    } catch (err) {
      setError(err.message || "Unable to update product status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-(--admin-hover)" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="h-80 animate-pulse rounded-xl bg-(--admin-surface) xl:col-span-8" />
          <div className="h-80 animate-pulse rounded-xl bg-(--admin-surface) xl:col-span-4" />
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="inline-flex items-center gap-2 text-sm font-medium text-(--admin-muted) transition hover:text-(--admin-text)"
        >
          <ArrowLeft size={16} />
          Back to Products
        </button>

        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) p-4 text-(--admin-status-danger-text)"
        >
          <div className="flex items-center gap-2.5 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={fetchProductDetails}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--admin-status-danger-border) px-3 py-1.5 text-xs font-semibold"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const onHand = Number(product.inventory?.onHand ?? 0);
  const reserved = Number(product.inventory?.reserved ?? 0);
  const available = Number(product.availableStock ?? product.stock ?? 0);
  const isOut = available === 0;
  const isLow = available > 0 && available <= LOW_STOCK_THRESHOLD;
  const attributeEntries = Object.entries(product.attributes || {});

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-(--admin-border) pb-5 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-(--admin-muted) transition hover:text-(--admin-brand-text)"
          >
            <ArrowLeft size={15} />
            Back to Products
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-(--admin-text) sm:text-2xl">
              {product.name}
            </h1>
            <StatusBadge status={product.status} type="product" />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--admin-muted)">
            <span>SKU: {product.sku || "Not assigned"}</span>
            <span>Category: {product.category?.name || "Uncategorized"}</span>
            {product.brand?.name && <span>Brand: {product.brand.name}</span>}
          </div>
        </div>

        {/* Primary & Secondary Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleArchiveToggle}
            disabled={actionLoading}
            className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
              product.status === "archived"
                ? "border-(--admin-status-success-border) bg-(--admin-status-success-bg) text-(--admin-status-success-text)"
                : "border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) text-(--admin-status-danger-text)"
            }`}
          >
            {product.status === "archived" ? (
              <>
                <RotateCcw size={16} />
                Restore Product
              </>
            ) : (
              <>
                <Archive size={16} />
                Archive Product
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-2 rounded-lg bg-(--admin-brand) px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-(--admin-brand-hover)"
          >
            <Pencil size={16} />
            Edit Product
          </button>
        </div>
      </div>

      {/* Feedback Banners */}
      {notice && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-(--admin-status-success-border) bg-(--admin-status-success-bg) px-4 py-3 text-sm text-(--admin-status-success-text)">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) px-4 py-3 text-sm text-(--admin-status-danger-text)"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main 12-Column Detail Workspace */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        {/* Left 8 Columns: Inventory, Pricing, Description & Specifications */}
        <div className="space-y-6 xl:col-span-8">
          {/* Inventory & Stock Breakdown */}
          <AdminCard>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-(--admin-text)">
                  Inventory & Stock Availability
                </h2>
                <p className="mt-0.5 text-xs text-(--admin-muted)">
                  Sellable stock equals On-Hand minus Reserved units for active
                  orders.
                </p>
              </div>

              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  isOut
                    ? "border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) text-(--admin-status-danger-text)"
                    : isLow
                      ? "border-(--admin-status-warning-border) bg-(--admin-status-warning-bg) text-(--admin-status-warning-text)"
                      : "border-(--admin-status-success-border) bg-(--admin-status-success-bg) text-(--admin-status-success-text)"
                }`}
              >
                {isOut
                  ? "Out of stock"
                  : isLow
                    ? `Low stock (${available} left)`
                    : "In stock"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-(--admin-border) bg-(--admin-bg) p-4">
                <p className="text-xs font-medium text-(--admin-muted)">
                  Available to Sell
                </p>
                <p className="mt-1.5 text-2xl font-bold text-(--admin-text)">
                  {available}
                </p>
              </div>

              <div className="rounded-lg border border-(--admin-border) bg-(--admin-bg) p-4">
                <p className="text-xs font-medium text-(--admin-muted)">
                  Physical On-Hand
                </p>
                <p className="mt-1.5 text-2xl font-bold text-(--admin-text)">
                  {onHand}
                </p>
              </div>

              <div className="rounded-lg border border-(--admin-border) bg-(--admin-bg) p-4">
                <p className="text-xs font-medium text-(--admin-muted)">
                  Reserved in Orders
                </p>
                <p className="mt-1.5 text-2xl font-bold text-(--admin-text)">
                  {reserved}
                </p>
              </div>
            </div>
          </AdminCard>

          {/* Pricing & Financials */}
          <AdminCard>
            <div className="mb-4 flex items-center gap-2">
              <Tag size={17} className="text-(--admin-brand-text)" />
              <h2 className="text-base font-semibold text-(--admin-text)">
                Pricing & Financials
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-(--admin-border) bg-(--admin-bg) p-4">
                <p className="text-xs font-medium text-(--admin-muted)">
                  Selling Price
                </p>
                <p className="mt-1.5 text-lg font-bold text-(--admin-brand-text)">
                  {formatLkr(product.price)}
                </p>
              </div>

              <div className="rounded-lg border border-(--admin-border) bg-(--admin-bg) p-4">
                <p className="text-xs font-medium text-(--admin-muted)">
                  Compare-At (Original)
                </p>
                <p className="mt-1.5 text-lg font-semibold text-(--admin-text)">
                  {formatLkr(product.originalPrice)}
                </p>
              </div>

              <div className="rounded-lg border border-(--admin-border) bg-(--admin-bg) p-4">
                <p className="text-xs font-medium text-(--admin-muted)">
                  Acquisition Cost
                </p>
                <p className="mt-1.5 text-lg font-semibold text-(--admin-text)">
                  {formatLkr(product.costPrice)}
                </p>
              </div>
            </div>
          </AdminCard>

          {/* Description & Category Attributes */}
          <AdminCard>
            <div className="mb-4 flex items-center gap-2">
              <Layers size={17} className="text-(--admin-brand-text)" />
              <h2 className="text-base font-semibold text-(--admin-text)">
                Description & Specifications
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-(--admin-muted)">
                  Description
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-(--admin-text)">
                  {product.description?.trim() ||
                    "No product description provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 border-t border-(--admin-border) pt-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-(--admin-muted)">
                    Condition
                  </p>
                  <p className="mt-1 text-sm font-medium capitalize text-(--admin-text)">
                    {product.condition || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-xs font-medium text-(--admin-muted)">
                    <ShieldCheck size={14} />
                    Warranty
                  </p>
                  <p className="mt-1 text-sm font-medium text-(--admin-text)">
                    {formatWarranty(product.warranty)}
                  </p>
                </div>
              </div>

              {attributeEntries.length > 0 && (
                <div className="border-t border-(--admin-border) pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-(--admin-muted)">
                    Category Specifications
                  </p>

                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {attributeEntries.map(([key, val]) => (
                      <div
                        key={key}
                        className="rounded-lg border border-(--admin-border) bg-(--admin-bg) px-3.5 py-2.5"
                      >
                        <dt className="text-xs text-(--admin-muted)">
                          {formatAttributeLabel(key)}
                        </dt>
                        <dd className="mt-0.5 text-sm font-medium text-(--admin-text)">
                          {formatAttributeValue(val)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </AdminCard>
        </div>

        {/* Right 4 Columns: Product Media & Metadata */}
        <div className="space-y-6 xl:col-span-4">
          <AdminCard>
            <h2 className="mb-4 text-base font-semibold text-(--admin-text)">
              Product Image
            </h2>

            {product.mainImage ? (
              <div className="overflow-hidden rounded-xl border border-(--admin-border) bg-(--admin-bg)">
                <img
                  src={product.mainImage}
                  alt={product.name}
                  className="aspect-square w-full object-contain p-3"
                />
              </div>
            ) : (
              <div className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-(--admin-border) bg-(--admin-bg) text-(--admin-muted)">
                <Package size={32} />
                <p className="mt-2 text-xs">No primary image uploaded</p>
              </div>
            )}
          </AdminCard>

          <AdminCard>
            <div className="mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-(--admin-brand-text)" />
              <h2 className="text-base font-semibold text-(--admin-text)">
                Record Metadata
              </h2>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-(--admin-muted)">URL Slug</dt>
                <dd className="truncate font-mono text-xs text-(--admin-text)">
                  {product.slug}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2">
                <dt className="text-(--admin-muted)">Customer Rating</dt>
                <dd className="font-medium text-(--admin-text)">
                  {Number(product.averageRating || 0).toFixed(1)} / 5 (
                  {product.reviewCount || 0} reviews)
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-(--admin-border) pt-3">
                <dt className="text-(--admin-muted)">Created</dt>
                <dd className="text-xs text-(--admin-text)">
                  {formatDateTime(product.createdAt)}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2">
                <dt className="text-(--admin-muted)">Last Updated</dt>
                <dd className="text-xs text-(--admin-text)">
                  {formatDateTime(product.updatedAt)}
                </dd>
              </div>
            </dl>
          </AdminCard>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editableProduct && (
        <ProductForm
          product={editableProduct}
          categories={categories}
          brands={[]}
          onSubmit={handleSaveEdit}
          onClose={() => {
            setShowEditModal(false);
            setEditableProduct(null);
          }}
        />
      )}
    </div>
  );
}
