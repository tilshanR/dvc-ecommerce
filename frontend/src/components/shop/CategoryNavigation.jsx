
import CategoryButton from "./CategoryButton";

export default function CategoryNavigation({
  categories,
  category,
  changeCategory,
  categoriesError,
}) {
  return (
    <div className="mb-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        <CategoryButton
          active={category === "all"}
          onClick={() => changeCategory("all")}
        >
          All
        </CategoryButton>
      </div>

      {categories.map((mainCategory) => {
        const hasSubs = mainCategory.subcategories?.length > 0;

        const buttons = hasSubs
          ? [
              {
                ...mainCategory,
                buttonLabel: `All ${mainCategory.name}`,
              },
              ...mainCategory.subcategories.map((sub) => ({
                ...sub,
                buttonLabel: sub.name,
              })),
            ]
          : [
              {
                ...mainCategory,
                buttonLabel: mainCategory.name,
              },
            ];

        return (
          <div
            key={mainCategory.id}
            className="flex flex-wrap gap-2"
          >
            {buttons.map((item) => (
              <CategoryButton
                key={item.id}
                active={category === item.slug}
                onClick={() => changeCategory(item.slug)}
              >
                {item.buttonLabel}
              </CategoryButton>
            ))}
          </div>
        );
      })}

      {categoriesError && (
        <p className="text-sm text-red-600">
          {categoriesError}
        </p>
      )}
    </div>
  );
}
