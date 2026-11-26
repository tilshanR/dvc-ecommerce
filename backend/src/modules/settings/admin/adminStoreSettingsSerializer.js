/**
 * Format store settings for the Admin Portal (includes audit metadata).
 */
export const serializeAdminStoreSettings = (settings, districts = []) => {
  if (!settings) return null;

  return {
    shipping: settings.shipping,
    orderPolicies: settings.orderPolicies,
    legal: {
      termsAndConditions: settings.legal.termsAndConditions,
      termsUpdatedAt:
        settings.legal.termsUpdatedAt || settings.updatedAt || null,
    },
    updatedBy: settings.updatedBy || null,
    updatedAt: settings.updatedAt || null,
    districts,
  };
};