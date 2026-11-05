export default function CategoryButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-[#183D3D] bg-[#183D3D] text-white"
          : "border-gray-200 bg-white text-gray-700 hover:border-[#183D3D] hover:text-[#183D3D]"
      }`}
    >
      {children}
    </button>
  );
}
