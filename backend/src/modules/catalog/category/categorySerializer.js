/**
 * Convert a Category database document into
 * the API response format.
 */
export const categoryDTO = (category) => {
  if (!category) return null;

  // Convert Mongoose document into a plain object.
  // For an ordinary object, use it directly.
  const data =
    typeof category.toObject === "function"
      ? category.toObject({ virtuals: false })
      : category;

  // Handle both populated and unpopulated parent references.
  const parentId = data.parent ? String(data.parent._id ?? data.parent) : null;

  return {
    id: String(data._id),

    name: data.name,
    slug: data.slug,
    description: data.description,
    sortOrder: data.sortOrder,

    parent: parentId,

    attributes: data.attributes ?? [],
    allowCondition: data.allowCondition,
    status: data.status,

    isMainCategory: parentId === null,

    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

/**
 * Convert a category into a public Shop response.
 *
 * Only filterable attributes are exposed as filters.
 * Subcategories are converted recursively.
 */
export const shopCategoryDTO = (category) => {
  if (!category) return null;

  const parentId = category.parent
    ? String(category.parent._id ?? category.parent)
    : null;

  return {
    id: String(category._id),

    name: category.name,
    slug: category.slug,
    description: category.description,
    sortOrder: category.sortOrder,

    allowCondition: category.allowCondition,

    attributes: (category.attributes ?? [])
      .filter((attribute) => attribute.isFilterable)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((attribute) => ({
        key: attribute.key,
        label: attribute.label,
        type: attribute.type,
        options: attribute.options,
        unit: attribute.unit,
        isFilterable: attribute.isFilterable,
        sortOrder: attribute.sortOrder,
      })),

    parent: parentId,

    isMainCategory: parentId === null,

    subcategories: (category.subcategories ?? []).map(shopCategoryDTO),
  };
};

/**
 * Convert multiple categories into Shop response objects.
 */
export const shopCategoryDTOs = (categories) => {
  return categories.map(shopCategoryDTO);
};

/**
 * Convert an array of Category documents
 * into API response objects.
 */
export const categoryDTOs = (categories) => {
  return categories.map(categoryDTO);
};
