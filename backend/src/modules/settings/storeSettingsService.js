import StoreSettings, {
  DEFAULT_TERMS_AND_CONDITIONS,
} from "./storeSettingsModel.js";
import { updateStoreSettingsSchema } from "./storeSettingsValidation.js";

export const DEFAULT_STORE_SETTINGS = Object.freeze({
  shipping: {
    shopDistrict: "Matale",
    localBaseFee: 300,
    islandwideBaseFee: 450,
    extraKgFee: 150,
    baseWeightGrams: 1000,
    defaultItemWeightGrams: 500,
    freeShippingThreshold: 0,
  },
  orderPolicies: {
    onlinePaymentTimeoutMinutes: 30,
    storePickupHoldHours: 72,
    autoCancelStorePickup: true,
  },
  legal: {
    termsAndConditions: DEFAULT_TERMS_AND_CONDITIONS,
    termsUpdatedAt: null,
  },
});

const mergeWithDefaults = (doc) => ({
  shipping: {
    ...DEFAULT_STORE_SETTINGS.shipping,
    ...(doc?.shipping || {}),
  },
  orderPolicies: {
    ...DEFAULT_STORE_SETTINGS.orderPolicies,
    ...(doc?.orderPolicies || {}),
  },
  legal: {
    ...DEFAULT_STORE_SETTINGS.legal,
    ...(doc?.legal || {}),
  },
  updatedBy:
    doc?.updatedBy && typeof doc.updatedBy === "object"
      ? {
          id: doc.updatedBy._id?.toString(),
          name: doc.updatedBy.name || null,
          email: doc.updatedBy.email || null,
          role: doc.updatedBy.role || null,
        }
      : null,
  updatedAt: doc?.updatedAt || null,
});

export const getStoreSettings = async () => {
  const doc = await StoreSettings.findOne({ key: "default" })
    .populate("updatedBy", "name email role")
    .lean();

  return mergeWithDefaults(doc);
};

export const serializePublicStoreSettings = (settings) => ({
  shipping: settings.shipping,
  orderPolicies: settings.orderPolicies,
  legal: {
    termsAndConditions: settings.legal.termsAndConditions,
    termsUpdatedAt: settings.legal.termsUpdatedAt || settings.updatedAt || null,
  },
});

export const serializeAdminStoreSettings = (settings) => ({
  shipping: settings.shipping,
  orderPolicies: settings.orderPolicies,
  legal: {
    termsAndConditions: settings.legal.termsAndConditions,
    termsUpdatedAt: settings.legal.termsUpdatedAt || settings.updatedAt || null,
  },
  updatedBy: settings.updatedBy,
  updatedAt: settings.updatedAt,
});

export const updateStoreSettingsService = async (input, adminId) => {
  const validation = updateStoreSettingsSchema.safeParse(input);

  if (!validation.success) {
    const error = new Error("Invalid store settings data.");
    error.statusCode = 400;
    error.details = validation.error.flatten();
    throw error;
  }

  const { shipping, orderPolicies, legal } = validation.data;

  // Ensure singleton exists before applying partial section updates
  const settingsDoc = await StoreSettings.findOneAndUpdate(
    { key: "default" },
    { $setOnInsert: { key: "default" } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  if (shipping) {
    Object.entries(shipping).forEach(([field, value]) => {
      if (value !== undefined) {
        settingsDoc.shipping[field] = value;
      }
    });
  }

  if (orderPolicies) {
    Object.entries(orderPolicies).forEach(([field, value]) => {
      if (value !== undefined) {
        settingsDoc.orderPolicies[field] = value;
      }
    });
  }

  if (legal?.termsAndConditions !== undefined) {
    const prevTerms = (settingsDoc.legal?.termsAndConditions || "").trim();
    if (legal.termsAndConditions !== prevTerms) {
      settingsDoc.legal.termsAndConditions = legal.termsAndConditions;
      settingsDoc.legal.termsUpdatedAt = new Date();
    }
  }

  settingsDoc.updatedBy = adminId || null;
  await settingsDoc.save();
  await settingsDoc.populate("updatedBy", "name email role");

  return mergeWithDefaults(settingsDoc.toObject());
};
