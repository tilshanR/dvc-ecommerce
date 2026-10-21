import { useState } from "react";
import "./App.css";
// import { NavBar } from "./components/Navbar";
import NavBar from "./components/Navbar";
function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
       <NavBar />
      <header className="p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-dvcGreen">DVC E-Commerce</h1>
      </header>
      <main className="p-6">
        <p>Welcome to the store! Ready to build components.</p>
      </main>
    </div>
  );
}

export default App;
