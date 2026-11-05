import { ChevronDown } from "lucide-react";

export default function FilterSection({
  title,
  defaultOpen = false,
  children,
}) {
  return (
    <details open={defaultOpen} className="border-b border-gray-200 py-3">
      <summary className="cursor-pointer list-none font-medium text-gray-800">
        {title}
        <ChevronDown className="float-right" size={16} />
      </summary>

      {children}
    </details>
  );
}
