export default function DynamicAttributeFields({
  category,
  attributes = {},
  setFormData,
}) {
  if (!category) return null;

  const fields = [...(category.attributes || [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  const updateAttribute = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Product Specifications</h3>

      {fields.length === 0 && (
        <p className="text-sm text-gray-500">
          No specifications defined for this category.
        </p>
      )}

      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium mb-1">
            {field.label}
            {field.isRequired && <span className="text-red-500"> *</span>}
            {field.unit && (
              <span className="text-gray-500"> ({field.unit})</span>
            )}
          </label>

          {field.type === "text" && (
            <input
              type="text"
              required={field.isRequired}
              value={attributes[field.key] ?? ""}
              onChange={(e) => updateAttribute(field.key, e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          )}

          {field.type === "number" && (
            <input
              type="number"
              required={field.isRequired}
              value={attributes[field.key] ?? ""}
              onChange={(e) =>
                updateAttribute(
                  field.key,
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          )}

          {field.type === "select" && (
            <select
              required={field.isRequired}
              value={attributes[field.key] ?? ""}
              onChange={(e) => updateAttribute(field.key, e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select {field.label}</option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

          {field.type === "multiselect" && (
            <div>
              {field.options.map((option) => {
                const selected = attributes[field.key] || [];

                return (
                  <label
                    key={option}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...selected, option]
                          : selected.filter((item) => item !== option);

                        updateAttribute(field.key, updated);
                      }}
                    />
                    {option}
                  </label>
                );
              })}

              {field.isRequired &&
                (attributes[field.key] || []).length === 0 && (
                  <p className="text-xs text-red-500">
                    Select at least one {field.label}.
                  </p>
                )}
            </div>
          )}

          {field.type === "boolean" && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={attributes[field.key] ?? false}
                onChange={(e) => updateAttribute(field.key, e.target.checked)}
              />
              <span className="text-sm">Yes</span>
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
