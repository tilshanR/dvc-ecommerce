export default function ProductSpecifications({ description, specifications = {} }) {
  const entries = Object.entries(specifications || {});

  return (
    <div className="mt-8 rounded-xl bg-white p-5 shadow-sm md:p-8">
      <h2 className="border-b border-gray-200 pb-4 text-xl font-bold text-gray-900">
        Product Details
      </h2>

      <div className="grid gap-8 pt-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold text-gray-900">Description</h3>
          <p className="text-sm leading-7 text-gray-600">{description}</p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-gray-900">Specifications</h3>
          {entries.length > 0 ? (
            <dl className="divide-y divide-gray-100">
              {entries.map(([label, value]) => (
                <div key={label} className="grid grid-cols-2 gap-3 py-3 text-sm">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="wrap-break-words font-medium text-gray-900">
                    {typeof value === "object" && value !== null
                      ? JSON.stringify(value)
                      : String(value ?? "—")}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-gray-500">
              No specifications have been provided for this product.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
