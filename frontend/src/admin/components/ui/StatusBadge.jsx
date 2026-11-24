const TONE_STYLES = {
  success:
    "border-(--admin-status-success-border) bg-(--admin-status-success-bg) text-(--admin-status-success-text)",
  warning:
    "border-(--admin-status-warning-border) bg-(--admin-status-warning-bg) text-(--admin-status-warning-text)",
  danger:
    "border-(--admin-status-danger-border) bg-(--admin-status-danger-bg) text-(--admin-status-danger-text)",
  info: "border-(--admin-status-info-border) bg-(--admin-status-info-bg) text-(--admin-status-info-text)",
  neutral:
    "border-(--admin-status-neutral-border) bg-(--admin-status-neutral-bg) text-(--admin-status-neutral-text)",
};

//  enums from orderModel.js
const ORDER_STATUS_TONES = {
  Pending: "warning",
  Processing: "info",
  "Ready for Pickup": "warning",
  Shipped: "info",
  Delivered: "success",
  Cancelled: "danger",
};



const PAYMENT_STATUS_TONES = {
  Pending: "warning",
  Paid: "success",
  Failed: "danger",
  Refunded: "neutral",
};
const PRODUCT_STATUS_TONES = {
  active: "success",
  draft: "warning",
  archived: "neutral",
};

const TONE_MAPS = {
  order: ORDER_STATUS_TONES,
  payment: PAYMENT_STATUS_TONES,
  product: PRODUCT_STATUS_TONES,
};


export default function StatusBadge({
  status,
  type = "order",
  className = "",
}) {
  const toneMap = TONE_MAPS[type] || ORDER_STATUS_TONES;
  const tone = toneMap[status] || "neutral";
  const toneClass = TONE_STYLES[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${toneClass} ${className}`}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-current"
        aria-hidden="true"
      />
      {status || "Unknown"}
    </span>
  );
}