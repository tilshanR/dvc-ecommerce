
import "dotenv/config";
import mongoose from "mongoose";

import Category from "../src/modules/catalog/category/categoryModel.js";

const seedTestCategory = async () => {
  const uri = process.env.MONGODB_TEST_URI;

  if (!uri) {
    throw new Error("MONGODB_TEST_URI is missing from .env");
  }

  try {
    await mongoose.connect(uri);

    console.log("Connected to test database.");

    // Remove the previous test category, if it exists.
    await Category.deleteOne({
      slug: "test-smartphones",
    });

    // Create a fresh test category.
    const category = await Category.create({
      name: "Test Smartphones",
      slug: "test-smartphones",
      description: "Category for product creation testing.",
      sortOrder: 1,
      parent: null,
      attributes: [
        {
          key: "ram",
          label: "RAM",
          type: "select",
          options: ["4GB", "8GB", "12GB"],
          unit: "",
          isRequired: true,
          isFilterable: true,
          sortOrder: 1,
        },
      ],
      allowCondition: true,
      status: "active",
    });

    console.log("\nTest category created successfully!");
    console.log("Category ID:", category._id);
    console.log("Category name:", category.name);
    console.log("Category slug:", category.slug);
  } finally {
    await mongoose.disconnect();
    console.log("Test database connection closed.");
  }
};

seedTestCategory().catch((error) => {
  console.error("Category seeding failed:", error.message);
  process.exitCode = 1;
});
