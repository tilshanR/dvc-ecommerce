export default function ProductSpecifications({
  description,
  specifications = {},
}) {
  const entries = Object.entries(specifications || {});

  const hasDescription = Boolean(description && description.trim().length > 0);
  const hasSpecs = entries.length > 0;

  // UX PRINCIPLE: Graceful Degradation - hide the entire section if no data exists
  if (!hasDescription && !hasSpecs) return null;

  // Helper to turn database keys like "internal_storage" into "Internal Storage"
  const formatLabel = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="mt-8 rounded-xl bg-white p-5 shadow-sm md:p-8">
      <h2 className="border-b border-gray-200 pb-4 text-xl font-bold text-gray-900">
        Product Details
      </h2>

      {/* UX PRINCIPLE: Dynamic Layout - Use 1 column if only one section exists, 2 if both exist */}
      <div
        className={`grid gap-8 pt-6 ${hasDescription && hasSpecs ? "md:grid-cols-2" : "md:grid-cols-1"}`}
      >
        {hasDescription && (
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">Description</h3>
            <p className="text-sm leading-7 text-gray-600">{description}</p>
          </div>
        )}

        {hasSpecs && (
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">Specifications</h3>
            <dl className="divide-y divide-gray-100 border-t border-gray-100">
              {entries.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-2 gap-3 py-3 text-sm"
                >
                  <dt className="text-gray-500">{formatLabel(label)}</dt>
                  <dd className="wrap-break-words font-medium text-gray-900 capitalize">
                    {typeof value === "object" && value !== null
                      ? Array.isArray(value)
                        ? value.join(", ")
                        : JSON.stringify(value)
                      : String(value ?? "—")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
