import express from 'express';
import { paymentController } from './paymentController.js';
const router = express.Router();

router.get('/hash/:orderId', paymentController.getPaymentHash);

// IMPORTANT: PayHere webhooks are sent as URL Encoded Form Data, not JSON.
// applied the express.urlencoded middleware specifically to this route.
router.post(
  '/notify', 
  express.urlencoded({ extended: true }), 
  paymentController.handleWebhook
);

export default router;