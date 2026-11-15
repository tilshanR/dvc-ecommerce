export default function CheckoutInput({ 
  name, 
  label, 
  type = "text", 
  required = true, 
  value, 
  onChange, 
  error, 
  autoComplete 
}) {
  const inputClass =
    "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#183D3D] focus:ring-2 focus:ring-[#183D3D]/10";

  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${inputClass} ${
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : ""
        }`}
      />

      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}