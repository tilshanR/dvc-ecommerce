import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";

//Eagerly load global providers, layouts, and the Home page (crucial for initial speed)
import Home from "./pages/Home";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";

// Lazy load all secondary public pages
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Shop = lazy(() => import("./pages/Shop"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));

// Lazy load all Admin routes (This removes a massive amount of bloat from the initial load)
const AdminLayout = lazy(() => import("./admin/components/AdminLayout"));
const AdminDashboard = lazy(() => import("./admin/pages/AdminDashboard"));
const AdminCategories = lazy(() => import("./admin/pages/AdminCategories"));
const AdminProducts = lazy(() => import("./admin/pages/AdminProducts"));
const AdminOrders = lazy(() => import("./admin/pages/AdminOrders"));
const AdminOrderDetails = lazy(() => import("./admin/pages/AdminOrderDetails"));

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
        
        {/* Suspense catches the lazy-loaded components and shows a fallback while they download */}
        <Suspense 
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-white text-gray-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#143630]"></div>
            </div>
          }
        >
          <Routes>
            {/* Public storefront routes */}
            <Route element={<PublicLayout />}>
              {/* Home remains eager-loaded so it renders instantly */}
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
        </Suspense>
        
      </CartProvider>
    </ToastProvider>
  );
}

export default App;