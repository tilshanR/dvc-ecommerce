
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
  const parentId = data.parent
    ? String(data.parent._id ?? data.parent)
    : null;

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
 * Convert an array of Category documents
 * into API response objects.
 */
export const categoryDTOs = (categories) => {
  return categories.map(categoryDTO);
};
