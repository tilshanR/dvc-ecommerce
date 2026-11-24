export const DEFAULT_ORDER_POLICIES = Object.freeze({
  onlinePaymentTimeoutMinutes: 30,
  storePickupHoldHours: 72,
  autoCancelStorePickup: true,
});

/**
 * Returns active order hold policies.
 * Phase 5 will read these from the StoreSettings MongoDB collection with this fallback.
 */
export const getOrderPolicies = async () => {
  return { ...DEFAULT_ORDER_POLICIES };
};

/**
 * Calculates the snapshot expiry timestamp for a newly created order.
 * Returns null if automatic cancellation is disabled for that payment method.
 */
export const calculateOrderExpiry = (paymentMethod, policies, now = new Date()) => {
  if (paymentMethod === "Online Payment") {
    return new Date(now.getTime() + policies.onlinePaymentTimeoutMinutes * 60 * 1000);
  }

  if (paymentMethod === "Pay at Store" && policies.autoCancelStorePickup) {
    return new Date(now.getTime() + policies.storePickupHoldHours * 60 * 60 * 1000);
  }

  return null;
};