import CategoryButton from "./CategoryButton";

export default function CategoryNavigation({
  categories,
  category,
  changeCategory,
  categoriesError,
}) {
  // Keeps the parent pill highlighted even if the user is deep inside a subcategory
  const getActiveParentSlug = () => {
    if (category === "all") return "all";
    const parent = categories.find(
      (c) => c.slug === category || c.subcategories?.some((s) => s.slug === category)
    );
    return parent ? parent.slug : "all";
  };

  const activeParentSlug = getActiveParentSlug();

  return (
    <div className="mb-2">
      {/* Single clean row, hides scrollbar for native app feel */}
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-width:none">
        <CategoryButton
          active={activeParentSlug === "all"}
          onClick={() => changeCategory("all")}
        >
          All
        </CategoryButton>

        {categories.map((mainCategory) => (
          <CategoryButton
            key={mainCategory.id}
            active={activeParentSlug === mainCategory.slug}
            onClick={() => changeCategory(mainCategory.slug)}
          >
            {mainCategory.name}
          </CategoryButton>
        ))}
      </div>

      {categoriesError && (
        <p className="mt-2 text-sm text-red-600">
          {categoriesError}
        </p>
      )}
    </div>
  );
}