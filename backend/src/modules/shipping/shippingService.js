import Product from "../catalog/product/productModel.js";
import { getStoreSettings } from "../settings/storeSettingsService.js";
import { shippingQuoteSchema } from "./shippingValidation.js";

/**
 * Pure single-source-of-truth shipping calculator.
 * Used by both POST /api/shipping/quote and createOrderService.
 */
export const calculateShippingFromItems = ({
  itemsWithProducts,
  checkoutMethod,
  district = null,
  shippingConfig,
}) => {
  const {
    shopDistrict = "Matale",
    localBaseFee = 300,
    islandwideBaseFee = 450,
    extraKgFee = 150,
    baseWeightGrams = 1000,
    defaultItemWeightGrams = 500,
    freeShippingThreshold = 0,
  } = shippingConfig || {};

  let subtotal = 0;
  let totalWeightGrams = 0;

  for (const { product, quantity } of itemsWithProducts) {
    const unitPrice = Number(product.price) || 0;
    const unitWeight =
      Number(product.weightGrams) > 0
        ? Number(product.weightGrams)
        : defaultItemWeightGrams;

    subtotal += unitPrice * quantity;
    totalWeightGrams += unitWeight * quantity;
  }

  const thresholdActive = freeShippingThreshold > 0;
  const qualifiesForFreeShipping =
    thresholdActive && subtotal >= freeShippingThreshold;
  const amountUntilFreeShipping = thresholdActive
    ? Math.max(0, freeShippingThreshold - subtotal)
    : 0;

  // Store pickup orders never incur delivery fees
  if (checkoutMethod !== "delivery-online") {
    return {
      subtotal,
      shippingCost: 0,
      total: subtotal,
      totalWeightGrams,
      chargeableExtraKg: 0,
      freeShippingApplied: false,
      freeShippingThreshold,
      amountUntilFreeShipping: 0,
      tier: "pickup",
      district: null,
      shopDistrict,
      requiresDistrict: false,
    };
  }

  const extraGrams = Math.max(0, totalWeightGrams - baseWeightGrams);
  const chargeableExtraKg = Math.ceil(extraGrams / 1000);
  const extraWeightFee = chargeableExtraKg * extraKgFee;

  if (qualifiesForFreeShipping) {
    return {
      subtotal,
      shippingCost: 0,
      total: subtotal,
      totalWeightGrams,
      chargeableExtraKg,
      freeShippingApplied: true,
      freeShippingThreshold,
      amountUntilFreeShipping: 0,
      tier: "free",
      district: district || null,
      shopDistrict,
      requiresDistrict: !district,
    };
  }

  // When Cart requests a preview before a district is selected, return starting rates
  if (!district) {
    return {
      subtotal,
      shippingCost: null,
      total: null,
      totalWeightGrams,
      chargeableExtraKg,
      freeShippingApplied: false,
      freeShippingThreshold,
      amountUntilFreeShipping,
      tier: "unselected",
      district: null,
      shopDistrict,
      requiresDistrict: true,
      estimatedFrom: {
        local: localBaseFee + extraWeightFee,
        islandwide: islandwideBaseFee + extraWeightFee,
      },
    };
  }

  const isLocal = district === shopDistrict;
  const baseFee = isLocal ? localBaseFee : islandwideBaseFee;
  const shippingCost = baseFee + extraWeightFee;

  return {
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    totalWeightGrams,
    chargeableExtraKg,
    freeShippingApplied: false,
    freeShippingThreshold,
    amountUntilFreeShipping,
    tier: isLocal ? "local" : "islandwide",
    district,
    shopDistrict,
    requiresDistrict: false,
  };
};

/**
 * Public quote service backed by live DB product prices/weights and StoreSettings.
 */
export const getShippingQuoteService = async (input) => {
  const validation = shippingQuoteSchema.safeParse(input);

  if (!validation.success) {
    const error = new Error("Invalid shipping quote request.");
    error.statusCode = 400;
    error.details = validation.error.flatten();
    throw error;
  }

  const { items, checkoutMethod, district } = validation.data;

  // Deduplicate repeated productIds so weight and subtotal stay accurate
  const qtyByProductId = new Map();
  for (const item of items) {
    qtyByProductId.set(
      item.productId,
      (qtyByProductId.get(item.productId) || 0) + item.quantity,
    );
  }

  const uniqueIds = [...qtyByProductId.keys()];

  const [products, settings] = await Promise.all([
    Product.find({ _id: { $in: uniqueIds }, status: "active" })
      .select("_id name price weightGrams")
      .lean(),
    getStoreSettings(),
  ]);

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));
  const itemsWithProducts = [];

  for (const [productId, quantity] of qtyByProductId.entries()) {
    const product = productMap.get(productId);
    if (!product) {
      const error = new Error(
        "One or more items in your cart are no longer available.",
      );
      error.statusCode = 400;
      throw error;
    }
    itemsWithProducts.push({ product, quantity });
  }

  return calculateShippingFromItems({
    itemsWithProducts,
    checkoutMethod,
    district: district || null,
    shippingConfig: settings.shipping,
  });
};