import mongoose from "mongoose";

const { Schema } = mongoose;

/* --------------------------------
   ORDER ITEM SCHEMA (Sub-document)
--------------------------------- */
// This embedded schema creates an immutable "snapshot" of the product 
// at the exact moment of purchase. Even if the original product's price, 
// name, or image changes later, the order receipt remains historically accurate.
const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    
    // Snapshot fields
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number.",
      },
    },
    image: {
      type: String, // Primary image URL snapshot
      default: "",
    },
  },
  { _id: false }
);

/* --------------------------------
   MAIN ORDER SCHEMA
--------------------------------- */
const orderSchema = new Schema(
  {
    // Custom readable ID for PayHere, customers, and admins (e.g., ORD-1698754)
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Guest checkout details (No user account required)
    customer: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },

    // Nullable for "pickup-store" or "pickup-online"
    shippingAddress: {
      streetAddress: { type: String, trim: true },
      city: { type: String, trim: true },
      postcode: { type: String, trim: true },
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "An order must contain at least one item.",
      },
    },

    // Financials (Calculated backend-side, ignoring frontend input)
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // Fulfillment & Payment Methods (Driven by frontend selection)
    checkoutMethod: {
      type: String,
      enum: ["delivery-online", "pickup-online", "pickup-store"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Online Payment", "Pay at Store"],
      required: true,
    },

    // Track state of PayHere integration
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
      index: true,
    },

    // Core internal fulfillment lifecycle
    orderStatus: {
      type: String,
      enum: [
        "Pending", 
        "Processing", 
        "Ready for Pickup", 
        "Shipped", 
        "Delivered", 
        "Cancelled"
      ],
      default: "Pending",
      index: true,
    },

    // FUTURE-PROOFING: Third-party courier tracking architecture
    fulfillment: {
      courierProvider: { type: String, default: null, trim: true }, // e.g., "Koombiyo", "Courier.lk"
      trackingNumber: { type: String, default: null, trim: true },
      dispatchedAt: { type: Date, default: null },
      deliveredAt: { type: Date, default: null },
    },

    // Tracks atomic stock lifecycle to prevent double-deduction or double-restock
    inventoryState: {
      type: String,
      enum: ["reserved", "committed", "released"],
      default: "reserved",
      index: true,
    },

    // Snapshot deadline for automatic expiry (null = manual cancellation only)
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    // Optional admin notes for internal staff communication
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/* --------------------------------
   INDEXES
--------------------------------- */
// Optimize common admin dashboard queries
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "customer.email": 1 });
orderSchema.index({ "customer.phone": 1 });
orderSchema.index({orderStatus: 1, paymentStatus: 1, expiresAt: 1})

/* --------------------------------
   EXPORT MODEL
--------------------------------- */
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;