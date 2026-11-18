import { ChevronDown } from "lucide-react";

export default function FilterSection({
  title,
  defaultOpen = false,
  children,
}) {
  return (
    <details open={defaultOpen} className="group border-b border-gray-200 py-3 last:border-0">
      <summary className="flex cursor-pointer select-none list-none items-center justify-between font-medium text-gray-800 outline-none transition-colors hover:text-[#143630] [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown 
          className="text-gray-400 transition-transform duration-300 group-open:-rotate-180" 
          size={17} 
        />
      </summary>
      
      {children}
    </details>
  );
}