export default function AdminInput({
  label,
  helperText,
  id,
  className = "",value,
  ...props
}) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="admin-label">
          {label}
        </label>
      )}

      <input
        id={id}
        // Fallback to empty string if value is null or undefined
        value={value ?? ""}
        className={`admin-input mt-1.5 w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-700/20 ${className}`}
        {...props}
      />

      {helperText && (
        <p className="admin-muted mt-1 text-xs">{helperText}</p>
      )}
    </div>
  );
}