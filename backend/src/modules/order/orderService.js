import mongoose from "mongoose";

import Order from "./orderModel.js";
import {
  createOrder,
  findOrderById,
  updateOrderById,
} from "./orderRepository.js";
import { getOrderPolicies, calculateOrderExpiry } from "./orderPolicy.js";
import Product from "../catalog/product/productModel.js";
import {
  createOrderSchema,
  adminUpdateOrderSchema,
} from "./orderValidation.js";

// Helper to create consistent service errors mapped to errorMiddleware
const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Generate a unique, readable order number (e.g., ORD-1700123456)
const generateOrderNumber = () => `ORD-${Date.now().toString().slice(-8)}`;

const appendSystemNote = (existingNotes, systemNote) => {
  const current = (existingNotes || "").trim();
  if (current.includes(systemNote)) return current;
  return current ? `${current}\n${systemNote}` : systemNote;
};

/* --------------------------------
   ATOMIC INVENTORY HELPERS
--------------------------------- */
const reserveStockForItems = async (items, session) => {
  const reservedProducts = [];

  for (const item of items) {
    const productId = item.productId || item.product;
    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        status: "active",
        $expr: {
          $gte: [
            { $subtract: ["$inventory.onHand", "$inventory.reserved"] },
            item.quantity,
          ],
        },
      },
      { $inc: { "inventory.reserved": item.quantity } },
      { session, returnDocument: "after" },
    );

    if (!product) {
      const existing = await Product.findById(productId)
        .select("name")
        .session(session);
      const label = existing?.name ? `"${existing.name}"` : "A selected item";
      const err = createServiceError(
        `${label} is out of stock or no longer available.`,
        400,
      );
      err.code = "INSUFFICIENT_STOCK";
      throw err;
    }

    reservedProducts.push({ product, quantity: item.quantity });
  }

  return reservedProducts;
};

const releaseReservedStock = async (items, session) => {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product },
      [
        {
          $set: {
            "inventory.reserved": {
              $max: [
                0,
                {
                  $subtract: [
                    { $ifNull: ["$inventory.reserved", 0] },
                    item.quantity,
                  ],
                },
              ],
            },
          },
        },
      ],
      { session },
    );
  }
};

const commitReservedStock = async (items, session) => {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product },
      [
        {
          $set: {
            "inventory.reserved": {
              $max: [
                0,
                {
                  $subtract: [
                    { $ifNull: ["$inventory.reserved", 0] },
                    item.quantity,
                  ],
                },
              ],
            },
            "inventory.onHand": {
              $max: [
                0,
                {
                  $subtract: [
                    { $ifNull: ["$inventory.onHand", 0] },
                    item.quantity,
                  ],
                },
              ],
            },
          },
        },
      ],
      { session },
    );
  }
};

const restockCommittedItems = async (items, session) => {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { "inventory.onHand": item.quantity } },
      { session },
    );
  }
};

/* --------------------------------
   1. STOREFRONT: CREATE ORDER
--------------------------------- */
export const createOrderService = async (input) => {
  const validation = createOrderSchema.safeParse({ body: input });

  if (!validation.success) {
    const error = createServiceError("Invalid checkout details.", 400);
    error.details = validation.error.flatten();
    throw error;
  }

  const { customer, shippingAddress, items, checkoutMethod } =
    validation.data.body;
  const paymentMethod =
    checkoutMethod === "pickup-store" ? "Pay at Store" : "Online Payment";

  const policies = await getOrderPolicies();
  const expiresAt = calculateOrderExpiry(paymentMethod, policies);

  let newOrder;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const reservedItems = await reserveStockForItems(items, session);

      let subtotal = 0;
      const orderItemsSnapshot = reservedItems.map(({ product, quantity }) => {
        subtotal += product.price * quantity;

        const primaryImage =
          product.images?.find((img) => img.isPrimary)?.url ||
          product.images?.[0]?.url ||
          "";

        return {
          product: product._id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity,
          image: primaryImage,
        };
      });

      const shippingCost = checkoutMethod === "delivery-online" ? 500 : 0;
      const total = subtotal + shippingCost;

      const orderData = {
        orderNumber: generateOrderNumber(),
        customer,
        shippingAddress:
          checkoutMethod === "delivery-online" ? shippingAddress : undefined,
        items: orderItemsSnapshot,
        subtotal,
        shippingCost,
        total,
        checkoutMethod,
        paymentMethod,
        paymentStatus: "Pending",
        orderStatus: "Pending",
        inventoryState: "reserved",
        expiresAt,
      };

      newOrder = await createOrder(orderData, session);
    });
  } finally {
    await session.endSession();
  }

  return newOrder;
};

/* --------------------------------
   2. ADMIN: UPDATE ORDER (ATOMIC + GUARDED)
--------------------------------- */
export const updateAdminOrderService = async (orderId, input) => {
  const validation = adminUpdateOrderSchema.safeParse({
    params: { orderId },
    body: input,
  });

  if (!validation.success) {
    const error = createServiceError("Invalid order update data.", 400);
    error.details = validation.error.flatten();
    throw error;
  }

  const payload = validation.data.body;
  let updatedOrder;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const existingOrder = await findOrderById(orderId, session);
      if (!existingOrder) {
        throw createServiceError("Order not found.", 404);
      }

      const currentOrderStatus = existingOrder.orderStatus;
      const currentPaymentStatus = existingOrder.paymentStatus;
      const currentInventoryState = existingOrder.inventoryState || "reserved";
      const isOnlinePayment = existingOrder.paymentMethod === "Online Payment";
      const isPickup =
        existingOrder.checkoutMethod === "pickup-online" ||
        existingOrder.checkoutMethod === "pickup-store";

      const nextOrderStatus = payload.orderStatus ?? currentOrderStatus;
      const nextPaymentStatus = payload.paymentStatus ?? currentPaymentStatus;

      // Guard 1: Terminal fulfillment states cannot be reopened or reverted
      if (
        currentOrderStatus === "Cancelled" &&
        nextOrderStatus !== "Cancelled"
      ) {
        throw createServiceError(
          "Cancelled orders cannot be reopened because reserved stock has already been released.",
          400,
        );
      }

      if (
        currentOrderStatus === "Delivered" &&
        nextOrderStatus !== "Delivered"
      ) {
        throw createServiceError(
          "Delivered orders are final and cannot be moved to another fulfillment status.",
          400,
        );
      }

      if (
        payload.fulfillment &&
        (currentOrderStatus === "Cancelled" ||
          currentOrderStatus === "Delivered")
      ) {
        throw createServiceError(
          "Courier tracking details cannot be modified on cancelled or delivered orders.",
          400,
        );
      }

      // Guard 2: Channel-specific fulfillment statuses
      if (isPickup && nextOrderStatus === "Shipped") {
        throw createServiceError(
          'Store pickup orders cannot use "Shipped". Use "Ready for Pickup" instead.',
          400,
        );
      }
      if (!isPickup && nextOrderStatus === "Ready for Pickup") {
        throw createServiceError(
          'Home delivery orders cannot use "Ready for Pickup". Use "Shipped" instead.',
          400,
        );
      }

      // Guard 3: Online payment status can only be manually moved from Paid -> Refunded
      if (isOnlinePayment && payload.paymentStatus !== undefined) {
        const isAllowedOnlineOverride =
          payload.paymentStatus === currentPaymentStatus ||
          (currentPaymentStatus === "Paid" &&
            payload.paymentStatus === "Refunded");

        if (!isAllowedOnlineOverride) {
          throw createServiceError(
            "Online payment statuses are managed by PayHere. Only Paid orders may be marked Refunded.",
            400,
          );
        }
      }

      // Guard 4: Cannot advance unpaid Online Payment orders past Pending
      const advancingOnlineStatuses = [
        "Processing",
        "Ready for Pickup",
        "Shipped",
        "Delivered",
      ];
      if (
        isOnlinePayment &&
        nextPaymentStatus !== "Paid" &&
        advancingOnlineStatuses.includes(nextOrderStatus) &&
        nextOrderStatus !== currentOrderStatus
      ) {
        throw createServiceError(
          "Cannot process or fulfill an unpaid online order until PayHere confirms payment.",
          400,
        );
      }

      // Guard 5: Pay-at-Store orders must be marked Paid before completing pickup
      if (
        !isOnlinePayment &&
        nextOrderStatus === "Delivered" &&
        nextPaymentStatus !== "Paid"
      ) {
        throw createServiceError(
          'Collect payment and mark Payment Status as "Paid" before completing store pickup.',
          400,
        );
      }

      // Build safe update object
      const updateFields = {};
      if (payload.orderStatus !== undefined) {
        updateFields.orderStatus = nextOrderStatus;
      }
      if (payload.paymentStatus !== undefined) {
        updateFields.paymentStatus = nextPaymentStatus;
      }
      if (payload.notes !== undefined) {
        updateFields.notes = payload.notes;
      }
      if (payload.fulfillment !== undefined) {
        updateFields.fulfillment = { ...payload.fulfillment };
      }

      // Inventory lifecycle transitions
      if (
        nextOrderStatus === "Cancelled" &&
        currentOrderStatus !== "Cancelled"
      ) {
        if (currentInventoryState === "reserved") {
          await releaseReservedStock(existingOrder.items, session);
          updateFields.inventoryState = "released";
        } else if (currentInventoryState === "committed") {
          await restockCommittedItems(existingOrder.items, session);
          updateFields.inventoryState = "released";
        }

        // Prevent stuck "Pending Payment + Cancelled Fulfillment" on online orders
        if (isOnlinePayment && currentPaymentStatus === "Pending") {
          updateFields.paymentStatus = "Failed";
        }
      } else if (
        (nextOrderStatus === "Shipped" || nextOrderStatus === "Delivered") &&
        currentInventoryState === "reserved"
      ) {
        await commitReservedStock(existingOrder.items, session);
        updateFields.inventoryState = "committed";
      }

      // Auto-stamp dispatch / delivery timestamps
      if (
        nextOrderStatus === "Shipped" &&
        !existingOrder.fulfillment?.dispatchedAt &&
        !updateFields.fulfillment?.dispatchedAt
      ) {
        updateFields.fulfillment = {
          ...(updateFields.fulfillment || {}),
          dispatchedAt: new Date(),
        };
      }

      if (
        nextOrderStatus === "Delivered" &&
        !existingOrder.fulfillment?.deliveredAt &&
        !updateFields.fulfillment?.deliveredAt
      ) {
        updateFields.fulfillment = {
          ...(updateFields.fulfillment || {}),
          deliveredAt: new Date(),
        };
      }

      updatedOrder = await updateOrderById(orderId, updateFields, session);
    });
  } finally {
    await session.endSession();
  }

  return updatedOrder;
};

/* --------------------------------
   3. PAYHERE WEBHOOK PROCESSING
--------------------------------- */
export const processPayHereWebhookService = async ({
  orderId,
  statusCode,
  amount,
  currency,
}) => {
  const session = await mongoose.startSession();
  let outcome = { status: "ignored" };
  let needsLateRefundFallback = false;

  try {
    await session.withTransaction(async () => {
      const order = await findOrderById(orderId, session);
      if (!order) {
        outcome = { status: "not_found" };
        return;
      }

      // Verify paid amount & currency on success callbacks
      if (statusCode === 2) {
        const expectedAmount = Number(order.total).toFixed(2);
        const receivedAmount = Number(amount).toFixed(2);
        const expectedCurrency = order.currency || "LKR";

        if (
          receivedAmount !== expectedAmount ||
          (currency && currency !== expectedCurrency)
        ) {
          order.notes = appendSystemNote(
            order.notes,
            `[ACTION REQUIRED] PayHere amount/currency mismatch (received ${currency} ${receivedAmount}, expected ${expectedCurrency} ${expectedAmount}).`,
          );
          await order.save({ session });
          outcome = { status: "mismatch" };
          return;
        }

        // Idempotency: ignore duplicate success webhooks
        if (
          order.paymentStatus === "Paid" ||
          order.paymentStatus === "Refunded"
        ) {
          outcome = { status: "already_processed" };
          return;
        }

        // Late payment arrived AFTER cancellation/expiry
        if (
          order.orderStatus === "Cancelled" &&
          order.inventoryState === "released"
        ) {
          try {
            await reserveStockForItems(order.items, session);
            order.paymentStatus = "Paid";
            order.orderStatus = "Processing";
            order.inventoryState = "reserved";
            order.notes = appendSystemNote(
              order.notes,
              "[System] Late PayHere payment received after cancellation; stock re-reserved automatically.",
            );
            await order.save({ session });
            outcome = { status: "reopened_and_paid" };
            return;
          } catch (err) {
            if (err.code === "INSUFFICIENT_STOCK") {
              // Abort this transaction to undo any partial reservations,
              // then record Paid + refund-required flag cleanly outside.
              needsLateRefundFallback = true;
              throw err;
            }
            throw err;
          }
        }

        // Normal confirmation path (never downgrade Shipped/Delivered on retries)
        order.paymentStatus = "Paid";
        if (order.orderStatus === "Pending") {
          order.orderStatus = "Processing";
        }
        await order.save({ session });
        outcome = { status: "paid" };
        return;
      }

      // Customer cancelled (-1) or payment failed (-2) at PayHere
      if (statusCode === -1 || statusCode === -2) {
        if (
          order.orderStatus === "Pending" &&
          order.paymentStatus === "Pending"
        ) {
          if ((order.inventoryState || "reserved") === "reserved") {
            await releaseReservedStock(order.items, session);
            order.inventoryState = "released";
          }
          order.paymentStatus = "Failed";
          order.orderStatus = "Cancelled";
          order.notes = appendSystemNote(
            order.notes,
            `[System] PayHere payment ${statusCode === -1 ? "cancelled by customer" : "failed"}. Reserved stock released.`,
          );
          await order.save({ session });
          outcome = { status: "failed_and_cancelled" };
        }
        return;
      }

      // Chargeback (-3): post-payment dispute — never silently restock dispatched goods
      if (statusCode === -3) {
        order.paymentStatus = "Refunded";
        if (
          (order.orderStatus === "Pending" ||
            order.orderStatus === "Processing") &&
          (order.inventoryState || "reserved") === "reserved"
        ) {
          await releaseReservedStock(order.items, session);
          order.inventoryState = "released";
          order.orderStatus = "Cancelled";
        }
        order.notes = appendSystemNote(
          order.notes,
          "[ACTION REQUIRED] PayHere chargeback (status -3) received. Review order immediately.",
        );
        await order.save({ session });
        outcome = { status: "chargeback_recorded" };
      }
    });
  } catch (error) {
    if (needsLateRefundFallback) {
      await Order.findByIdAndUpdate(orderId, {
        $set: {
          paymentStatus: "Paid",
          notes: appendSystemNote(
            (await Order.findById(orderId).select("notes"))?.notes,
            "[ACTION REQUIRED] Late PayHere payment received after cancellation/expiry, but item(s) are out of stock. Issue manual refund.",
          ),
        },
      });
      return { status: "late_payment_refund_required" };
    }
    throw error;
  } finally {
    await session.endSession();
  }

  return outcome;
};

/* --------------------------------
   4. AUTOMATIC EXPIRY & STOCK RELEASE
--------------------------------- */
export const expireSingleOrderService = async (orderId) => {
  const session = await mongoose.startSession();
  let expired = false;

  try {
    await session.withTransaction(async () => {
      const order = await findOrderById(orderId, session);
      if (!order) return;

      const isOverdue =
        order.expiresAt && new Date(order.expiresAt) <= new Date();

      if (
        !isOverdue ||
        order.orderStatus !== "Pending" ||
        order.paymentStatus !== "Pending"
      ) {
        return;
      }

      if ((order.inventoryState || "reserved") === "reserved") {
        await releaseReservedStock(order.items, session);
        order.inventoryState = "released";
      }

      const isOnlinePayment = order.paymentMethod === "Online Payment";
      order.orderStatus = "Cancelled";
      if (isOnlinePayment) {
        order.paymentStatus = "Failed";
      }
      order.notes = appendSystemNote(
        order.notes,
        isOnlinePayment
          ? "[System] Auto-cancelled: online payment window expired. Reserved stock released."
          : "[System] Auto-cancelled: store pickup hold window expired. Reserved stock released.",
      );

      await order.save({ session });
      expired = true;
    });
  } finally {
    await session.endSession();
  }

  return expired;
};

export const expireOverdueOrdersService = async (batchSize = 50) => {
  const overdueOrders = await Order.find({
    orderStatus: "Pending",
    paymentStatus: "Pending",
    expiresAt: { $ne: null, $lte: new Date() },
  })
    .select("_id")
    .limit(batchSize)
    .lean();

  let expiredCount = 0;

  for (const doc of overdueOrders) {
    try {
      const didExpire = await expireSingleOrderService(doc._id);
      if (didExpire) expiredCount += 1;
    } catch (err) {
      console.error(
        `[OrderExpiryJob] Failed to expire order ${doc._id}:`,
        err.message,
      );
    }
  }

  return expiredCount;
};