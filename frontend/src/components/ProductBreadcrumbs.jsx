import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function ProductBreadcrumbs({ category, name }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm text-gray-500"
      >
        <Link to="/" className="hover:text-[#183d3d]">Home</Link>
        <ChevronRight size={15} />
        <Link to="/shop" className="hover:text-[#183d3d]">Shop</Link>
        <ChevronRight size={15} />
        <span>{category}</span>
        <ChevronRight size={15} />
        <span className="font-medium text-gray-900">{name}</span>
      </nav>
    </div>
  );
}
