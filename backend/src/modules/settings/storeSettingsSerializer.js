/**
 * Format store settings for public storefront consumption (Checkout, OrderSuccess, Terms).
 * Excludes internal admin audit metadata (updatedBy).
 */
export const serializePublicStoreSettings = (settings, districts = []) => {
  if (!settings) return null;

  return {
    shipping: settings.shipping,
    orderPolicies: settings.orderPolicies,
    legal: {
      termsAndConditions: settings.legal.termsAndConditions,
      termsUpdatedAt:
        settings.legal.termsUpdatedAt || settings.updatedAt || null,
    },
    districts,
  };
};