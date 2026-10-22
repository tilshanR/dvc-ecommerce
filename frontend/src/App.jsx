
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar";
import About from "./pages/About";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <NavBar />

      <Routes>
        <Route
          path="/aboutus"
          element={<About />}
        />

        <Route
          path="/"
          element={
            <main className="p-6">
              <h1 className="text-2xl font-bold text-dvcGreen">
                DVC E-Commerce
              </h1>
              <p className="mt-3">
                Welcome to the store!
              </p>
            </main>
          }
        />
      </Routes>
            <Footer />

    </div>
  );
}

export default App;
