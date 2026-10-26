import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

export default function ProductBenefits({ warranty }) {
  const warrantyText = warranty?.duration
    ? `${warranty.duration} ${warranty.unit || "months"} warranty.`
    : typeof warranty === "string"
      ? warranty
      : "Check warranty availability with our team.";

  const benefits = [
    {
      Icon: Truck,
      title: "Islandwide Delivery",
      description: "Delivery charges calculated at checkout.",
    },
    {
      Icon: ShieldCheck,
      title: "Manufacturer Warranty",
      description: warrantyText,
    },
    {
      Icon: RotateCcw,
      title: "Returns & Support",
      description: "Contact our team for return policy details.",
    },
  ];

  return (
    <div className="mt-7 divide-y divide-gray-100 rounded-lg border border-gray-200">
      {benefits.map(({ Icon, title, description }) => (
        <div key={title} className="flex gap-4 p-4">
          <Icon className="shrink-0 text-[#477b70]" size={22} />
          <div>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
