export default function ShopHeader({ selectedCategory }) {
  return (
    <section className="bg-[#183D3D] text-white">
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
          DVC Store
        </p>

        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          {selectedCategory
            ? `Shop ${selectedCategory.name}`
            : "Shop all products"}
        </h1>

        <p className="mt-3 max-w-2xl text-sm text-gray-200 sm:text-base">
          {selectedCategory?.description ||
            "Explore our collection of products available at DVC Store."}
        </p>
      </div>
    </section>
  );
}
