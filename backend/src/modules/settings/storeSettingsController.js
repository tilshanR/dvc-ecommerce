import catchAsync from "../../middleware/catchAsync.js";
import { getStoreSettings } from "./storeSettingsService.js";
import { serializePublicStoreSettings } from "./storeSettingsSerializer.js";
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
