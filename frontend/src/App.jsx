
import { Routes, Route, Outlet } from "react-router-dom";

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

// Temporary products page until product management is implemented
function AdminProductsPlaceholder() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">
        Product Management
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Manage and organize your store products.
      </p>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="font-medium text-gray-700">
          Product management is coming soon.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          This section is currently under development.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <CartProvider>
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
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products" element={<AdminProductsPlaceholder />} />
          </Route>
        </Routes>
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
