export default function AdminSelect({
  label,
  helperText,
  id,
  className = "",
  children,
  ...props
}) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="admin-label">
          {label}
        </label>
      )}

      <select
        id={id}
        className={`admin-input mt-1.5 w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-700/20 ${className}`}
        {...props}
      >
        {children}
      </select>

      {helperText && (
        <p className="admin-muted mt-1 text-xs">{helperText}</p>
      )}
    </div>
  );
}