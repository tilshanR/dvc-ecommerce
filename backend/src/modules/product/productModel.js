
import mongoose from "mongoose";

const { Schema } = mongoose;

//product image schema
const productImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    alt: {
      type: String,
      trim: true,
      default: "",
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);



//product inventory schema
const inventorySchema = new Schema(
  {
    // total physical stock currently owned by the store.
    onHand: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger, //Runs a check to ensure the number is a whole integer
        message: "On-hand stock must be a whole number.",
      },
    },

    // stock temporarily reserved for pending orders.
    reserved: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger, ////Runs a check to ensure the number is a whole integer
        message: "Reserved stock must be a whole number.",
      },
    },
  },
  { _id: false }
);

//main product schema
const productSchema = new Schema(
  {
    //basic info
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: undefined,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 10000,
    },

//category and brand
// ==========================================
  // PRICING & FINANCIALS
  // - price: Current active customer selling price.
  // - originalPrice: Pre-discount "compare-at" price for sales.
  // - costPrice: Wholesale/acquisition cost (hidden by default 
  //   via select: false for margin calculations & admin eyes only).
  // ==========================================

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
    },

    // price
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    originalPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    // Hidden from normal Mongoose queries.
    // Only expose through an authorized Super Admin operation.
    costPrice: {
      type: Number,
      default: null,
      min: 0,
      select: false,
    },


    // product imgs
    images: {
      type: [productImageSchema],
      default: [],
      validate: {
        validator: function (images) {
          const primaryCount = images.filter(
            (image) => image.isPrimary
          ).length;

          return primaryCount <= 1;
        },
        message: "A product can have only one primary image.",
      },
    },


    // inventory
    inventory: {
      type: inventorySchema,
      default: () => ({
        onHand: 0,
        reserved: 0,
      }),
    },


    // Product condition
    condition: {
      type: String,
      enum: ["new", "used", null],
      default: null,
    },


    // DYNAMIC CATEGORY-SPECIFIC ATTRIBUTES
    //
    // Example:
    // {
    //   capacity: 4,
    //   generation: "DDR4",
    //   frequency: 2666
    // }
    //
    // Actual allowed keys and value types are validated
    // against the selected Category in productService.js.

    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // WARRANTY
    warranty: {
      type: String,
      trim: true,
      default: null,
      maxlength: 300,
    },


    // PRODUCT RATINGS
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // PRODUCT LIFECYCLE
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);


/* --------------------------------
   VIRTUAL FIELDS
--------------------------------- */
// A virtual field is a computed property that is calculated
//  on the fly and not saved in the database.
/**
 * availableStock (Virtual)
 * Dynamically calculates currently sellable physical stock.
 * Formula: Math.max(0, inventory.onHand - inventory.reserved)
 * Prevents negative stock counts if reservations exceed on-hand items.
 */

// Stock that can currently be sold.
productSchema.virtual("availableStock").get(function () {
  return Math.max(
    0,
    this.inventory.onHand - this.inventory.reserved
  );
});

// Convenient primary image URL.
productSchema.virtual("mainImage").get(function () {
  const primaryImage = this.images.find(
    (image) => image.isPrimary
  );

  return (
    primaryImage?.url ||
    this.images[0]?.url ||
    ""
  );
});

// Compatibility with frontend components that use `image`.
productSchema.virtual("image").get(function () {
  return this.mainImage;
});

// Compatibility with ProductSpecifications.jsx.
productSchema.virtual("specifications").get(function () {
  return this.attributes;
});

// Compatibility with older frontend code that reads `stock`.
productSchema.virtual("stock").get(function () {
  return this.availableStock;
});


/* --------------------------------
   INDEXES
--------------------------------- */

// Category filtering.
productSchema.index({
  category: 1,
  status: 1,
});

// Brand filtering.
productSchema.index({
  brand: 1,
  status: 1,
});

// Newest products.
productSchema.index({
  status: 1,
  createdAt: -1,
});

// Product search.
productSchema.index({
  name: "text",
  description: "text",
});

// SKU must be unique when supplied.
// Draft products can exist without a SKU.
productSchema.index(
  { sku: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sku: { $type: "string" },
    },
  }
);


/* --------------------------------
   EXPORT MODEL
--------------------------------- */

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

export default Product;
