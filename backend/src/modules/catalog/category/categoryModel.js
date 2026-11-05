import mongoose from "mongoose";

const { Schema } = mongoose;

/* CATEGORY ATTRIBUTE SCHEMA */

const categoryAttributeSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z][a-z0-9_]*$/,
        "Attribute key must start with a letter and contain only letters, numbers, and underscores.",
      ],
    },

    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    type: {
      type: String,
      required: true,
      enum: ["text", "number", "select", "multiselect", "boolean"],
    },

    options: {
      type: [String],
      default: [],
      validate: {
        validator: function (options) {
          if (["select", "multiselect"].includes(this.type)) {
            return options.length > 0;
          }

          return options.length === 0;
        },
        message: "Invalid options for this attribute type.",
      },
    },

    unit: {
      type: String,
      trim: true,
      default: "",
      maxlength: 30,
    },

    isRequired: {
      type: Boolean,
      default: false,
    },

    isFilterable: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

/* MAIN CATEGORY SCHEMA */

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    // Controls the display order of categories.
    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Null means this is a main category.
    // An ObjectId means this is a subcategory.
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    // Dynamic attributes defined by the admin.
    attributes: {
      type: [categoryAttributeSchema],
      default: [],
      validate: {
        validator: function (attributes) {
          const keys = attributes.map((attribute) => attribute.key);
          return keys.length === new Set(keys).size;
        },
        message: "Attribute keys must be unique within a category.",
      },
    },

    // Whether products in this category can be new or used.
    allowCondition: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* VIRTUAL FIELDS */

// Get the category's subcategories.
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Check whether this is a main category.
categorySchema.virtual("isMainCategory").get(function () {
    return !this.parent;
});

/* INDEXES */

categorySchema.index({ parent: 1, status: 1 });
categorySchema.index({ status: 1, name: 1 });

/* MODEL */

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
