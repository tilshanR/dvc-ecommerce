import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";

//Eagerly load global providers, layouts, and the Home page (crucial for initial speed)
import Home from "./pages/Home";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";

import ProtectedAdminRoute from "./admin/components/ProtectedAdminRoute";

// Lazy load all secondary public pages
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Shop = lazy(() => import("./pages/Shop"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
// Lazy load Admin auth pages
const AdminLogin = lazy(() => import("./admin/pages/AdminLogin"));
const AdminSignup = lazy(() => import("./admin/pages/AdminSignup"));
const AdminForgotPassword = lazy(
  () => import("./admin/pages/AdminForgotPassword"),
);
const AdminResetPassword = lazy(
  () => import("./admin/pages/AdminResetPassword"),
);

// Lazy load protected Admin pages
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
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <NavBar />
      {/* The main content area grows to fill space, and Suspense only replaces this section */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex h-[60vh] w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#143630]"></div>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <AdminAuthProvider>
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
                <Route
                  path="/products/:productId"
                  element={<ProductDetails />}
                />
                <Route path="/cart" element={<Cart />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route
                  path="/order-success/:orderId"
                  element={<OrderSuccess />}
                />
              </Route>
              {/* Public Admin Auth routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/signup" element={<AdminSignup />} />
              <Route
                path="/admin/forgot-password"
                element={<AdminForgotPassword />}
              />
              <Route
                path="/admin/reset-password/:token"
                element={<AdminResetPassword />}
              />

              {/* Admin routes */}
              <Route element={<ProtectedAdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route
                    path="orders/:orderId"
                    element={<AdminOrderDetails />}
                  />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </AdminAuthProvider>
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
