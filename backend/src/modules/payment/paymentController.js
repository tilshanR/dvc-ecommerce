import { paymentService } from '../services/paymentService.js';
import {Order} from '../order/orderModel.js';

export const paymentController = {
  /**
   * GET /api/payments/hash/:orderId
   * Called by the frontend right before submitting the PayHere form.
   */
  getPaymentHash: async (req, res) => {
    try {
      const { orderId } = req.params;
      
      // Fetch order from your DB to guarantee the amount is untampered
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const hash = paymentService.generateCheckoutHash(
        order._id.toString(), 
        order.totalAmount, 
        order.currency || 'LKR'
      );

      res.status(200).json({
        merchantId: process.env.PAYHERE_MERCHANT_ID,
        hash,
        amount: Number(order.totalAmount).toFixed(2),
        currency: order.currency || 'LKR'
      });
    } catch (error) {
      console.error('Error generating payment hash:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  /**
   * POST /api/payments/notify
   * Webhook endpoint called by PayHere servers.
   */
  handleWebhook: async (req, res) => {
    try {
      // PayHere sends data as application/x-www-form-urlencoded
      const payload = req.body; 

      //  Verify the signature to ensure the request actually came from PayHere
      const isValid = paymentService.verifyWebhookSignature(payload);
      
      if (!isValid) {
        console.warn(`Invalid PayHere signature for order: ${payload.order_id}`);
        // Return 400 so PayHere knows it failed, but don't leak logic details
        return res.status(400).send('Invalid Signature');
      }

      //  Process based on status_code
      // 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Charged back
      const { order_id, status_code } = payload;
      const statusCodeInt = parseInt(status_code, 10);

      const order = await Order.findById(order_id);
      if (!order) {
        return res.status(404).send('Order Not Found');
      }

      if (statusCodeInt === 2) {
        order.paymentStatus = 'Paid';
        order.orderStatus = 'Processing';
        await order.save();
        console.log(`Order ${order_id} payment successful.`);
      } else if (statusCodeInt < 0) {
        order.paymentStatus = 'Failed';
        // Note: You might want to trigger your stock reservation rollback logic here
        await order.save();
        console.log(`Order ${order_id} payment failed or canceled.`);
      }

      // PayHere expects a 200 OK response to stop retrying the webhook
      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).send('Server Error');
    }
  }
};