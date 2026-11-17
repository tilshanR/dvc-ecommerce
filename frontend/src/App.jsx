import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Shop from "./pages/Shop";
import Checkout from "./pages/Checkout";

import NavBar from "./components/Navbar";
import Footer from "./components/Footer";

import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";

import AdminLayout from "./admin/components/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminCategories from "./admin/pages/AdminCategories";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminOrderDetails from "./admin/pages/AdminOrderDetails";
import OrderSuccess from "./pages/OrderSuccess";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
// Public storefront layout
function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <NavBar />
      <Outlet />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          {/* Public storefront routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/aboutus" element={<About />} />
            <Route path="/contact-us" element={<Contact />} />
            <Route path="/products/:productId" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:orderId" element={<AdminOrderDetails />} />
          </Route>
        </Routes>
        <ScrollToTop />
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
