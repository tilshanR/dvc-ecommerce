import mongoose from "mongoose";
import { describe, it, expect } from "vitest";
import Product from "../../../../src/modules/catalog/product/productModel.js";

const testCases = [
  {
    name: "allows 10 on-hand and 0 reserved",
    onHand: 10,
    reserved: 0,
    shouldPass: true,
  },
  {
    name: "allows 10 on-hand and 10 reserved",
    onHand: 10,
    reserved: 10,
    shouldPass: true,
  },
  {
    name: "rejects reserved stock greater than on-hand stock",
    onHand: 10,
    reserved: 15,
    shouldPass: false,
    expectedErrorPath: "inventory.reserved",
  },
  {
    name: "allows zero on-hand and zero reserved",
    onHand: 0,
    reserved: 0,
    shouldPass: true,
  },
  {
    name: "rejects negative on-hand stock",
    onHand: -5,
    reserved: 0,
    shouldPass: false,
    expectedErrorPath: "inventory.onHand",
  },
  {
    name: "rejects negative reserved stock",
    onHand: 10,
    reserved: -2,
    shouldPass: false,
    expectedErrorPath: "inventory.reserved",
  },
  {
    name: "rejects decimal on-hand stock",
    onHand: 10.5,
    reserved: 2,
    shouldPass: false,
    expectedErrorPath: "inventory.onHand",
  },
];

describe("Product inventory validation", () => {
  it.each(testCases)(
    "$name",
    async ({ onHand, reserved, shouldPass, expectedErrorPath }) => {
      const product = new Product({
        name: "Inventory Test Product",
        slug: "inventory-test-product",
        category: new mongoose.Types.ObjectId(),
        price: 1000,
        inventory: {
          onHand,
          reserved,
        },
      });

      if (shouldPass) {
        await expect(product.validate()).resolves.toBeUndefined();
      } else {
        const error = await product.validate().then(
          () => null,
          (err) => err,
        );

        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);

        expect(error.errors[expectedErrorPath]).toBeDefined();
      }
    },
  );
});


describe("Product SKU normalization", () => {
  it.each([
    ["lowercase SKU", "sam-s24-128", "SAM-S24-128"],
    ["uppercase SKU", "SAM-S24-128", "SAM-S24-128"],
    ["empty SKU", "", undefined],
    ["whitespace SKU", "   ", undefined],
  ])("normalizes %s correctly", (_name, input, expected) => {
    const product = new Product({
      sku: input,
    });

    expect(product.sku).toBe(expected);
  });

  it("uses undefined when SKU is omitted", () => {
    const product = new Product({});

    expect(product.sku).toBeUndefined();
  });
});

