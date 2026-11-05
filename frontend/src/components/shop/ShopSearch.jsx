
import { Search } from "lucide-react";

export default function ShopSearch({
  search,
  handleSearchChange,
}) {
  return (
    <label className="relative block">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        size={19}
      />

      <input
        type="search"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search products or brands..."
        className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#183D3D] focus:ring-2 focus:ring-[#183D3D]/15"
      />
    </label>
  );
}
