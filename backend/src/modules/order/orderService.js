import mongoose from "mongoose";

import {
  createOrder,
  findOrderById,
  updateOrderById,
} from "./orderRepository.js";
import Product from "../catalog/product/productModel.js";
import {
  createOrderSchema,
  adminUpdateOrderSchema,
} from "./orderValidation.js";

// Helper to create consistent service errors mapped to your errorMiddleware
const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Generate a unique, readable order number (e.g., ORD-1700123456)
const generateOrderNumber = () => `ORD-${Date.now().toString().slice(-8)}`;

/* --------------------------------
   STOREFRONT: CREATE ORDER
--------------------------------- */
export const createOrderService = async (input) => {
  // Validate incoming checkout payload
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

  let newOrder;

  // Initialize MongoDB Session for Atomic Transaction
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      let subtotal = 0;
      const orderItemsSnapshot = [];

      // Process each item and reserve stock safely
      for (const item of items) {
        // ATOMIC UPDATE: Decrements stock ONLY if availableStock (onHand - reserved) >= requested quantity.
        // This prevents race conditions if two users click checkout at the exact same millisecond.
        const product = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            status: "active",
            $expr: {
              $gte: [
                { $subtract: ["$inventory.onHand", "$inventory.reserved"] },
                item.quantity,
              ],
            },
          },
          {
            $inc: { "inventory.reserved": item.quantity },
          },
          { session, new: true },
        );

        if (!product) {
          throw createServiceError(
            `Product ID ${item.productId} is out of stock or does not exist.`,
            400,
          );
        }

        // Calculate secure backend subtotal
        subtotal += product.price * item.quantity;

        // Take snapshot of product data for the receipt
        const primaryImage =
          product.images?.find((img) => img.isPrimary)?.url ||
          product.images?.[0]?.url ||
          "";

        orderItemsSnapshot.push({
          product: product._id,
          name: product.name,
          sku: product.sku,
          price: product.price, // Authentic DB price
          quantity: item.quantity,
          image: primaryImage,
        });
      }

      // Calculate Final Totals
      // You can adjust this logic if shipping costs vary by city or weight later.
      const shippingCost = checkoutMethod === "delivery-online" ? 500 : 0;
      const total = subtotal + shippingCost;

      // Construct and Save Order Document
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
      };

      newOrder = await createOrder(orderData, session);
    });
  } catch (error) {
    // If anything fails (e.g., out of stock), the transaction aborts automatically
    // and undoes any stock reservations made during the loop.
    throw error;
  } finally {
    await session.endSession();
  }

  return newOrder;
};

/* --------------------------------
   2. ADMIN: UPDATE ORDER
--------------------------------- */
export const updateAdminOrderService = async (orderId, input) => {
  //  Validate ID and payload
  const validation = adminUpdateOrderSchema.safeParse({
    params: { orderId },
    body: input,
  });

  if (!validation.success) {
    const error = createServiceError("Invalid order update data.", 400);
    error.details = validation.error.flatten();
    throw error;
  }

  const existingOrder = await findOrderById(orderId);
  if (!existingOrder) {
    throw createServiceError("Order not found.", 404);
  }

  // Execute update
  const updatedOrder = await updateOrderById(orderId, validation.data.body);

  // NOTE FOR LATER: If status changes to "Cancelled", you will want to add logic
  // here to decrement `inventory.reserved` or `inventory.onHand` to return stock.

  return updatedOrder;
};
