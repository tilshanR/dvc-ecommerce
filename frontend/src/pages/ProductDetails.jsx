import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getProduct, addProductToCart } from "../services/productApi";
import { normalizeProduct } from "../utils/productUtils";
import ProductBreadcrumbs from "../components/ProductBreadcrumbs";
import ProductGallery from "../components/ProductGallery";
import ProductInfo from "../components/ProductInfo";
import ProductSpecifications from "../components/ProductSpecifications";
import { ProductLoading, ProductLoadError } from "../components/ProductPageState";

export default function ProductDetails() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const loadProduct = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    setProduct(null);
    setCurrentImageIndex(0);
    setQuantity(1);
    setCartMessage("");
    setCartError("");

    try {
      const result = await getProduct(productId, { signal });
      if (!signal.aborted) setProduct(normalizeProduct(result));
    } catch (err) {
      if (!signal.aborted) setError(err.message || "Unable to load this product.");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    const controller = new AbortController();
    loadProduct(controller.signal);
    return () => controller.abort();
  }, [loadProduct, reloadKey]);

  const images = product?.images || [];

  const showPreviousImage = () => {
    setCurrentImageIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  };

  const showNextImage = () => {
    setCurrentImageIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  };

  const handleAddToCart = async () => {
    if (!product || cartLoading) return;
    if (!product.availableStock) {
      setCartError("This product is currently out of stock.");
      return;
    }
    if (quantity > product.availableStock) {
      setCartError("The requested quantity exceeds available stock.");
      return;
    }
    if (!product.id) {
      setCartError("This product is missing its product ID.");
      return;
    }

    setCartLoading(true);
    setCartMessage("");
    setCartError("");
    try {
      await addProductToCart(product.id, quantity);
      setCartMessage("Product added to your cart successfully.");
    } catch (err) {
      setCartError(err.message || "Could not add this product to your cart. Please try again.");
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) return <ProductLoading />;
  if (error || !product) {
    return (
      <ProductLoadError
        error={error}
        onRetry={() => setReloadKey((key) => key + 1)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <ProductBreadcrumbs category={product.category} name={product.name} />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-xl bg-white p-5 shadow-sm md:p-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery
            productName={product.name}
            condition={product.condition}
            images={images}
            currentImageIndex={currentImageIndex}
            onSelectImage={setCurrentImageIndex}
            onPreviousImage={showPreviousImage}
            onNextImage={showNextImage}
          />

          <ProductInfo
            product={product}
            quantity={quantity}
            onDecrease={() => {
              setQuantity((current) => Math.max(1, current - 1));
              setCartMessage("");
              setCartError("");
            }}
            onIncrease={() => {
              setQuantity((current) => Math.min(product.availableStock, current + 1));
              setCartMessage("");
              setCartError("");
            }}
            onAddToCart={handleAddToCart}
            cartLoading={cartLoading}
            cartMessage={cartMessage}
            cartError={cartError}
          />
        </div>

        <ProductSpecifications
          description={product.description}
          specifications={product.specifications}
        />
      </section>
    </main>
  );
}
