import catchAsync from "../../middleware/catchAsync.js";
import { getShippingQuoteService } from "./shippingService.js";

/**
 * @desc    Calculate live delivery fee quote from DB prices, weights, and StoreSettings
 * @route   POST /api/shipping/quote
 * @access  Public
 */
export const getShippingQuote = catchAsync(async (req, res) => {
  const quote = await getShippingQuoteService(req.body);

  res.status(200).json({
    success: true,
    data: quote,
  });
});