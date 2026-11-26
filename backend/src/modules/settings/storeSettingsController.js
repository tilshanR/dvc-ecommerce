import catchAsync from "../../middleware/catchAsync.js";
import {
  getStoreSettings,
  serializePublicStoreSettings,
  serializeAdminStoreSettings,
  updateStoreSettingsService,
} from "./storeSettingsService.js";
import { SRI_LANKA_DISTRICTS } from "../shipping/sriLankaDistricts.js";

/**
 * @desc    Get public shipping rules, order hold timers, and T&C
 * @route   GET /api/settings/public
 * @access  Public
 */
export const getPublicStoreSettings = catchAsync(async (req, res) => {
  const settings = await getStoreSettings();

  res.status(200).json({
    success: true,
    data: {
      ...serializePublicStoreSettings(settings),
      districts: SRI_LANKA_DISTRICTS,
    },
  });
});

/**
 * @desc    Get full store settings for the Admin Portal
 * @route   GET /api/admin/settings
 * @access  Private (admin, super_admin)
 */
export const getAdminStoreSettings = catchAsync(async (req, res) => {
  const settings = await getStoreSettings();

  res.status(200).json({
    success: true,
    data: {
      ...serializeAdminStoreSettings(settings),
      districts: SRI_LANKA_DISTRICTS,
    },
  });
});

/**
 * @desc    Update shipping rates, order policies, and T&C
 * @route   PATCH /api/admin/settings
 * @access  Private (super_admin only)
 */
export const updateAdminStoreSettings = catchAsync(async (req, res) => {
  const updated = await updateStoreSettingsService(req.body, req.user?._id);

  res.status(200).json({
    success: true,
    message: "Store settings updated successfully.",
    data: {
      ...serializeAdminStoreSettings(updated),
      districts: SRI_LANKA_DISTRICTS,
    },
  });
});