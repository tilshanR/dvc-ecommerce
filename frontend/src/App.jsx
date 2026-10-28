import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NavBar from "./components/Navbar";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Shop from "./pages/Shop";

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <NavBar />

      <Routes>
        <Route path="/aboutus" element={<About />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/" element={<Home />} />
        <Route path="/products/:productId" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/shop" element={<Shop />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
