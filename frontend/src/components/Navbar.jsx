import React from 'react'; 
import { ShoppingCart, Search } from 'lucide-react'; 

export default function Navbar() { 
  return ( 
    <nav className="flex items-center justify-between p-4 text-dvcGreen shadow-md">
      {/* Brand Name */}
      <div className="font-bold text-xl">
        DVC Center
      </div>

      {/* Search Bar Placeholder */}   
      <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-md">
        <Search size={20} className="text-gray-500" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-transparent outline-none"
        />
      </div>

      {/* Cart Icon */}  
      <button className="p-2 hover:bg-gray-100 rounded-full">
        <ShoppingCart size={24} />
      </button>
    </nav>
  ); 
}