import ShopSearch from "./ShopSearch";

export default function ShopHeader({ selectedCategory, search, handleSearchChange }) {
  return (
    <div className="bg-[#143630] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {selectedCategory?.name || "Shop All Products"}
        </h1>
        <p className="mt-3 text-lg text-emerald-100/90">
          Browse our extensive collection of components, hardware, and accessories.
        </p>
        
        {/* Search bar nested */}
        <div className="mx-auto mt-8 max-w-xl text-left">
          <ShopSearch search={search} handleSearchChange={handleSearchChange} />
        </div>
      </div>
    </div>
  );
}