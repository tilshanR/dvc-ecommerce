import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./ToastContext";
const CartContext = createContext(null);

const getProductId = (product) => String(product._id ?? product.id ?? "");

const getInitialCart = () => {
  try {
    const savedCart = localStorage.getItem("dvc-cart");
    const parsedCart = savedCart ? JSON.parse(savedCart) : [];
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(getInitialCart);

  useEffect(() => {
    localStorage.setItem("dvc-cart", JSON.stringify(cartItems));
  }, [cartItems]);
  const { showToast } = useToast();

  // const addToCart = (product) => {
  //   const id = getProductId(product);
  //   const stock = Number(product.availableStock ?? product.stock);

  //   if (!id || !Number.isFinite(stock) || stock <= 0) {
  //     return false;
  //   }

  //   const existingItem = cartItems.find((item) => item.id === id);

  //   if (existingItem && existingItem.quantity >= stock) {
  //     return false;
  //   }

  //   setCartItems((items) => {
  //     const currentItem = items.find((item) => item.id === id);

  //     if (currentItem) {
  //       if (currentItem.quantity >= stock) return items;

  //       return items.map((item) =>
  //         item.id === id
  //           ? { ...item, quantity: item.quantity + 1 }
  //           : item,
  //       );
  //     }

  //     const category =
  //       typeof product.category === "object"
  //         ? product.category?.name
  //         : product.category;

  //     return [
  //       ...items,
  //       {
  //         id,
  //         name: product.name ?? "Unnamed product",
  //         category: category ?? "Uncategorized",
  //         description: product.description ?? "",
  //         price: Number(product.price),
  //         quantity: 1,
  //         stock,
  //         image: product.image || "/images/product-placeholder.png",
  //       },
  //     ];
  //   });

  //   return true;
  // };
  
const addToCart = (product) => {
  const id = getProductId(product);
  const stock = Number(product.availableStock ?? product.stock);

  if (!id || !Number.isFinite(stock) || stock <= 0) {
    showToast("error", "This product is currently unavailable.");
    return false;
  }

  const existingItem = cartItems.find((item) => item.id === id);

  if (existingItem && existingItem.quantity >= stock) {
    showToast("error", "You have reached the available stock limit.");
    return false;
  }

  setCartItems((items) => {
    const currentItem = items.find((item) => item.id === id);

    if (currentItem) {
      if (currentItem.quantity >= stock) return items;

      return items.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    const category =
      typeof product.category === "object"
        ? product.category?.name
        : product.category;

    return [
      ...items,
      {
        id,
        name: product.name ?? "Unnamed product",
        category: category ?? "Uncategorized",
        description: product.description ?? "",
        price: Number(product.price),
        quantity: 1,
        stock,
        image: product.image || "/images/product-placeholder.png",
      },
    ];
  });

  showToast("success", `${product.name ?? "Product"} added to your cart.`);
  return true;
};


  const updateQuantity = (id, change) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.id !== String(id)) return item;

        const nextQuantity = item.quantity + change;

        if (nextQuantity < 1 || nextQuantity > item.stock) {
          return item;
        }

        return { ...item, quantity: nextQuantity };
      }),
    );
  };

  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== String(id)));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
