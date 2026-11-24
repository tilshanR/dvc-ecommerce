import mongoose from "mongoose";
import { paymentService } from "./paymentService.js";
import Order from "../order/orderModel.js";
import {
  expireSingleOrderService,
  processPayHereWebhookService,
} from "../order/orderService.js";

export const paymentController = {
  /**
   * GET /api/payments/hash/:orderId
   * Called by the frontend right before submitting the PayHere form.
   */
  getPaymentHash: async (req, res) => {
    try {
      const { orderId } = req.params;

      if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({ message: "Invalid order ID." });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }

      if (order.paymentMethod !== "Online Payment") {
        return res.status(400).json({
          message:
            "This order uses Pay at Store and does not require online payment.",
        });
      }

      if (order.paymentStatus === "Paid") {
        return res.status(409).json({
          message: "This order has already been paid.",
          code: "ORDER_ALREADY_PAID",
        });
      }

      if (
        order.orderStatus === "Cancelled" ||
        order.paymentStatus === "Failed"
      ) {
        return res.status(409).json({
          message: "This order is no longer active. Please place a new order.",
          code: "ORDER_CANCELLED",
        });
      }

      // On-demand expiry check so expired orders can never open PayHere between sweep ticks
      if (order.expiresAt && new Date(order.expiresAt) <= new Date()) {
        await expireSingleOrderService(order._id);
        return res.status(410).json({
          message:
            "Payment window has expired and this order was cancelled. Please place a new order.",
          code: "ORDER_EXPIRED",
        });
      }

      const hash = paymentService.generateCheckoutHash(
        order._id.toString(),
        order.total,
        order.currency || "LKR",
      );

      res.status(200).json({
        merchantId: process.env.PAYHERE_MERCHANT_ID,
        hash,
        amount: Number(order.total).toFixed(2),
        currency: order.currency || "LKR",
        expiresAt: order.expiresAt || null,
      });
    } catch (error) {
      console.error("Error generating payment hash:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * POST /api/payments/notify
   * Webhook endpoint called by PayHere servers.
   */
  handleWebhook: async (req, res) => {
    try {
      const payload = req.body;

      const isValid = paymentService.verifyWebhookSignature(payload);
      if (!isValid) {
        console.warn(
          `Invalid PayHere signature for order: ${payload.order_id}`,
        );
        return res.status(400).send("Invalid Signature");
      }

      const { order_id, status_code, payhere_amount, payhere_currency } =
        payload;
      const statusCodeInt = parseInt(status_code, 10);

      if (!mongoose.isValidObjectId(order_id)) {
        return res.status(400).send("Invalid Order ID");
      }

      const result = await processPayHereWebhookService({
        orderId: order_id,
        statusCode: statusCodeInt,
        amount: payhere_amount,
        currency: payhere_currency,
      });

      if (result.status === "not_found") {
        return res.status(404).send("Order Not Found");
      }

      console.log(
        `[PayHere] Order ${order_id} webhook processed (status_code=${statusCodeInt}, outcome=${result.status}).`,
      );

      // Always return 200 OK once processed so PayHere stops retrying
      res.status(200).send("OK");
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).send("Server Error");
    }
  },
};
