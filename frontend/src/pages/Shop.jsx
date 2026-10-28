import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  PackageSearch,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";

const DEMO_PRODUCTS = [
  {
    _id: "m1",
    name: "Smartphone",
    category: "Mobile Phones",
    categorySlug: "mobile-phones",
    brand: "Samsung",
    phoneType: "smartphone",
    price: 68500,
    stock: 8,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-20",
  },
  {
    _id: "m2",
    name: "Feature Phone",
    category: "Mobile Phones",
    categorySlug: "mobile-phones",
    brand: "Nokia",
    phoneType: "feature-phone",
    price: 8500,
    stock: 12,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-18",
  },
  {
    _id: "a1",
    name: "USB-C Fast Charger",
    category: "Mobile Accessories",
    categorySlug: "mobile-accessories",
    brand: "Anker",
    accessoryType: "chargers",
    price: 4500,
    stock: 12,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-17",
  },
  {
    _id: "a2",
    name: "Wireless Earbuds",
    category: "Mobile Accessories",
    categorySlug: "mobile-accessories",
    brand: "Baseus",
    accessoryType: "audio",
    price: 6200,
    stock: 10,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-16",
  },
  {
    _id: "c1",
    name: "Mechanical Gaming Keyboard",
    category: "Computer Hardware",
    categorySlug: "computer-hardware",
    brand: "Logitech",
    condition: "new",
    componentType: "peripherals",
    price: 12500,
    stock: 5,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-15",
  },
  {
    _id: "c2",
    name: "DDR4 Desktop RAM",
    category: "Computer Hardware",
    categorySlug: "computer-hardware",
    brand: "Kingston",
    condition: "used",
    componentType: "memory",
    price: 8500,
    stock: 2,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-14",
  },

  {
    _id: "s1",
    name: "Blue Ballpoint Pen",
    category: "Stationery",
    categorySlug: "stationery",
    stationeryType: "writing-instruments",
    brand: "DVC",
    color: "blue",
    price: 150,
    stock: 40,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-13",
  },
  {
    _id: "s2",
    name: "HB Pencil Pack",
    category: "Stationery",
    categorySlug: "stationery",
    stationeryType: "writing-instruments",
    brand: "DVC",
    color: "black",
    packSize: 10,
    price: 350,
    stock: 25,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-12",
  },
  {
    _id: "s3",
    name: "A4 Paper Pack",
    category: "Stationery",
    categorySlug: "stationery",
    stationeryType: "paper-notebooks",
    brand: "DVC",
    paperSize: "A4",
    packSize: 500,
    price: 1800,
    stock: 15,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-11",
  },
  {
    _id: "s4",
    name: "Exercise Book",
    category: "Stationery",
    categorySlug: "stationery",
    stationeryType: "paper-notebooks",
    brand: "DVC",
    paperSize: "A4",
    price: 250,
    stock: 50,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-10",
  },
  {
    _id: "s5",
    name: "Eraser and Sharpener Set",
    category: "Stationery",
    categorySlug: "stationery",
    stationeryType: "geometry-tools",
    brand: "DVC",
    price: 200,
    stock: 20,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-09",
  },
  {
    _id: "s6",
    name: "Color Pencil Set",
    category: "Stationery",
    categorySlug: "stationery",
    stationeryType: "art-coloring",
    brand: "DVC",
    color: "mixed",
    packSize: 12,
    price: 650,
    stock: 18,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-08",
  },
  {
    _id: "s7",
    name: "Office Stapler",
    category: "Stationery",
    categorySlug: "stationery",
    stationeryType: "fasteners-adhesives",
    brand: "DVC",
    price: 750,
    stock: 8,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-07",
  },
  {
    _id: "s8",
    name: "Correction Tape",
    category: "Stationery",
    categorySlug: "stationery",
    stationeryType: "cutting-correction",
    brand: "DVC",
    price: 300,
    stock: 0,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-06",
  },
  {
    _id: "s9",
    name: "Document Folder",
    category: "Stationery",
    categorySlug: "stationery",
    stationeryType: "files-folders",
    brand: "DVC",
    color: "blue",
    price: 400,
    stock: 15,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-05",
  },
  {
    _id: "s10",
    name: "Desk Organizer",
    category: "Stationery",
    categorySlug: "stationery",
    stationeryType: "office-desk",
    brand: "DVC",
    color: "black",
    price: 1200,
    stock: 7,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-04",
  },
  {
    _id: "s11",
    name: "Children's Storybook",
    category: "Stationery",
    categorySlug: "stationery",
    stationeryType: "books-education",
    brand: "DVC",
    price: 850,
    stock: 11,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-03",
  },
  {
    _id: "s12",
    name: "Scientific Calculator",
    category: "Stationery",
    categorySlug: "stationery",
    stationeryType: "calculators-equipment",
    brand: "DVC",
    price: 2500,
    stock: 6,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-02",
  },
  {
    _id: "s13",
    name: "Greeting Card",
    category: "Stationery",
    categorySlug: "stationery",
    stationeryType: "cards-gifts",
    brand: "DVC",
    color: "mixed",
    price: 300,
    stock: 20,
    image: "/images/product-placeholder.png",
    createdAt: "2026-10-01",
  },
  {
    _id: "s14",
    name: "Decorative Sticker Sheet",
    category: "Stationery",
    categorySlug: "stationery",
    stationeryType: "stickers-labels",
    brand: "DVC",
    color: "mixed",
    price: 180,
    stock: 30,
    image: "/images/product-placeholder.png",
    createdAt: "2026-09-30",
  },
];

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "mobile", label: "Mobile Phones" },
  { value: "accessories", label: "Mobile Accessories" },
  { value: "computer", label: "Computer Parts" },
  { value: "stationery", label: "Stationery & Books" },
];

const STATIONERY_TYPES = [
  ["writing-instruments", "Writing Instruments"],
  ["paper-notebooks", "Paper, Exercise Books & Notebooks"],
  ["geometry-tools", "Erasers, Sharpeners & Geometry"],
  ["art-coloring", "Art & Coloring Supplies"],
  ["fasteners-adhesives", "Staplers, Fasteners & Adhesives"],
  ["cutting-correction", "Cutting & Correction Tools"],
  ["files-folders", "Files, Folders & Organizers"],
  ["office-desk", "Office Desk Supplies"],
  ["books-education", "Books & Educational Materials"],
  ["calculators-equipment", "Calculators & Office Equipment"],
  ["cards-gifts", "Cards & Gift Items"],
  ["stickers-labels", "Stickers & Labels"],
];

const FILTER_CONFIG = {
  mobile: ["Phone type", "Brand", "Storage", "RAM"],
  accessories: ["Accessory type", "Brand"],
  computer: ["Component type", "Brand", "Condition", "Compatibility"],
  stationery: ["Product type", "Brand", "Color", "Paper size", "Pack size"],
};


const normalizeCategory = (category) => {
  const value =
    typeof category === "string"
      ? category
      : typeof category?.name === "string"
        ? category.name
        : "";

  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-");

  if (!normalized) return "all";

  if (
    normalized.includes("stationery") ||
    normalized.includes("office-supplies")
  ) {
    return "stationery";
  }

  if (normalized.includes("mobile-accessories")) {
    return "accessories";
  }

  if (normalized.includes("mobile") || normalized.includes("phone")) {
    return "mobile";
  }

  if (normalized.includes("computer") || normalized.includes("peripheral")) {
    return "computer";
  }

  return normalized === "all" ? "all" : normalized;
};
function getCategory(product) {
  const slug = String(
    product.categorySlug || product.category?.slug || "",
  ).toLowerCase();
  if (slug.includes("stationery") || slug.includes("office-supplies"))
    return "stationery";
  if (slug.includes("mobile-accessories")) return "accessories";
  if (slug.includes("mobile")) return "mobile";
  if (slug.includes("computer") || slug.includes("peripheral"))
    return "computer";

  const category = String(
    product.category?.name || product.category || "",
  ).toLowerCase();
  if (category.includes("stationery") || category.includes("book"))
    return "stationery";
  if (category.includes("accessor")) return "accessories";
  if (category.includes("mobile") || category.includes("phone"))
    return "mobile";
  if (
    category.includes("computer") ||
    category.includes("hardware") ||
    category.includes("peripheral")
  )
    return "computer";
  return "all";
}

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return "Price unavailable";
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(price);
}

// Demo-only data loader. Need to replace with the express api
async function loadProducts(signal) {
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  return DEMO_PRODUCTS;
}

export default function Shop() {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(
    normalizeCategory(searchParams.get("category")),
  );
  const [subCategory, setSubCategory] = useState(
    searchParams.get("subCategory") || "",
  );
  const [condition, setCondition] = useState(
    searchParams.get("condition") || "all",
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [inStockOnly, setInStockOnly] = useState(
    searchParams.get("availability") === "in-stock",
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [color, setColor] = useState(searchParams.get("color") || "");
  const [phoneType, setPhoneType] = useState(
    searchParams.get("phoneType") || "",
  );
  const [componentType, setComponentType] = useState(
    searchParams.get("componentType") || "",
  );
  const [accessoryType, setAccessoryType] = useState(
    searchParams.get("accessoryType") || "",
  );
  const [paperSize, setPaperSize] = useState(
    searchParams.get("paperSize") || "",
  );
  const [packSize, setPackSize] = useState(searchParams.get("packSize") || "");

  useEffect(() => {
    const controller = new AbortController();
    loadProducts(controller.signal)
      .then(setProducts)
      .catch((err) => {
        if (err.name !== "AbortError") setError("We couldn't load products.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategory(normalizeCategory(searchParams.get("category")));
    setSubCategory(searchParams.get("subCategory") || "");
    setCondition(searchParams.get("condition") || "all");
    setSort(searchParams.get("sort") || "newest");
    setInStockOnly(searchParams.get("availability") === "in-stock");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setBrand(searchParams.get("brand") || "");
    setColor(searchParams.get("color") || "");
    setPhoneType(searchParams.get("phoneType") || "");
    setComponentType(searchParams.get("componentType") || "");
    setAccessoryType(searchParams.get("accessoryType") || "");
    setPaperSize(searchParams.get("paperSize") || "");
    setPackSize(searchParams.get("packSize") || "");
  }, [searchParams]);

  function updateQuery(values) {
    const next = new URLSearchParams(searchParams);
    Object.entries(values).forEach(([key, value]) => {
      if (value === "" || value === "all" || value == null || value === false)
        next.delete(key);
      else if (key === "availability" && value === true)
        next.set(key, "in-stock");
      else next.set(key, String(value));
    });
    setSearchParams(next, { replace: true });
  }

  function changeCategory(value) {
    setCategory(value);
    setSubCategory("");
    setCondition("all");
    setBrand("");
    setColor("");
    setPhoneType("");
    setComponentType("");
    setAccessoryType("");
    setPaperSize("");
    setPackSize("");
    updateQuery({
      category: value,
      subCategory: "",
      condition: "",
      brand: "",
      color: "",
      phoneType: "",
      componentType: "",
      accessoryType: "",
      paperSize: "",
      packSize: "",
    });
  }

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((p) => {
      const categoryMatch =
        query !== "" || category === "all" || getCategory(p) === category;
      const subcategoryMatch = !subCategory || p.stationeryType === subCategory;
      const text = [
        p.name,
        p.brand,
        p.description,
        p.category?.name || p.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const searchMatch = !query || text.includes(query);
      const conditionMatch =
        category !== "computer" ||
        condition === "all" ||
        p.condition === condition;
      const stockMatch =
        !inStockOnly || Number(p.stock ?? p.availableStock ?? 0) > 0;
      const price = Number(p.price);
      const minMatch = minPrice === "" || price >= Number(minPrice);
      const maxMatch = maxPrice === "" || price <= Number(maxPrice);
      const brandMatch =
        !brand || String(p.brand || "").toLowerCase() === brand.toLowerCase();
      const colorMatch =
        !color || String(p.color || "").toLowerCase() === color.toLowerCase();
      const phoneMatch =
        category !== "mobile" || !phoneType || p.phoneType === phoneType;
      const componentMatch =
        category !== "computer" ||
        !componentType ||
        p.componentType === componentType;
      const accessoryMatch =
        category !== "accessories" ||
        !accessoryType ||
        p.accessoryType === accessoryType;
      const paperMatch =
        category !== "stationery" || !paperSize || p.paperSize === paperSize;
      const packMatch =
        category !== "stationery" ||
        !packSize ||
        String(p.packSize || "") === packSize;

      return (
        categoryMatch &&
        subcategoryMatch &&
        searchMatch &&
        conditionMatch &&
        stockMatch &&
        minMatch &&
        maxMatch &&
        brandMatch &&
        colorMatch &&
        phoneMatch &&
        componentMatch &&
        accessoryMatch &&
        paperMatch &&
        packMatch
      );
    });

    return result.sort((a, b) => {
      if (sort === "price-low") return Number(a.price) - Number(b.price);
      if (sort === "price-high") return Number(b.price) - Number(a.price);
      if (sort === "name") return String(a.name).localeCompare(String(b.name));
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [
    products,
    category,
    subCategory,
    search,
    condition,
    inStockOnly,
    minPrice,
    maxPrice,
    brand,
    color,
    phoneType,
    componentType,
    accessoryType,
    paperSize,
    packSize,
    sort,
  ]);

  const categoryBrands = [
    ...new Set(
      products
        .filter((p) => category === "all" || getCategory(p) === category)
        .map((p) => p.brand)
        .filter(Boolean),
    ),
  ];

  function clearFilters() {
    setSearchParams({});
  }

  const activeFilterCount = [
    search,
    subCategory,
    condition !== "all" && category === "computer" ? condition : "",
    inStockOnly,
    minPrice,
    maxPrice,
    brand,
    color,
    phoneType,
    componentType,
    accessoryType,
    paperSize,
    packSize,
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-[#183D3D] text-white">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
            DVC Store
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Shop all products
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-200 sm:text-base">
            Explore mobile phones, computer parts, stationery, books, and
            accessories.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {CATEGORIES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => changeCategory(item.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  category === item.value
                    ? "border-[#183D3D] bg-[#183D3D] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[#183D3D] hover:text-[#183D3D]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="relative block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={19}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                const value = e.target.value;

                setSearch(value);
                setCategory("all");
                setSubCategory("");
                setCondition("all");
                setBrand("");
                setColor("");
                setPhoneType("");
                setComponentType("");
                setAccessoryType("");
                setPaperSize("");
                setPackSize("");

                updateQuery({
                  search: value,
                  category: "all",
                  subCategory: "",
                  condition: "",
                  brand: "",
                  color: "",
                  phoneType: "",
                  componentType: "",
                  accessoryType: "",
                  paperSize: "",
                  packSize: "",
                });
              }}
              placeholder="Search products or brands..."
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#183D3D] focus:ring-2 focus:ring-[#183D3D]/15"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[245px_minmax(0,1fr)]">
          <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                <SlidersHorizontal size={17} /> Filters
              </h2>
              
              <button
                type="button"
                onClick={clearFilters}
                disabled={
                  activeFilterCount === 0 &&
                  category === "all" &&
                  sort === "newest"
                }
                className="text-xs font-semibold text-dvcGreen hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
              >
                Reset filters
              </button>
            </div>

            <details open className="border-b border-gray-200 py-3">
              <summary className="cursor-pointer list-none font-medium text-gray-800">
                Availability <ChevronDown className="float-right" size={16} />
              </summary>
              <label className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    updateQuery({
                      availability: e.target.checked ? "in-stock" : "",
                    });
                  }}
                  className="accent-dvcGreen"
                />
                In stock only
              </label>
            </details>

            <details open className="border-b border-gray-200 py-3">
              <summary className="cursor-pointer list-none font-medium text-gray-800">
                Price (LKR) <ChevronDown className="float-right" size={16} />
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <input
                  aria-label="Minimum price"
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    updateQuery({ minPrice: e.target.value });
                  }}
                  className="min-w-0 rounded-md border border-gray-300 px-2 py-2 text-sm"
                />
                <input
                  aria-label="Maximum price"
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    updateQuery({ maxPrice: e.target.value });
                  }}
                  className="min-w-0 rounded-md border border-gray-300 px-2 py-2 text-sm"
                />
              </div>
            </details>

            <details open className="border-b border-gray-200 py-3">
              <summary className="cursor-pointer list-none font-medium text-gray-800">
                Brand <ChevronDown className="float-right" size={16} />
              </summary>
              <select
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  updateQuery({ brand: e.target.value });
                }}
                className="mt-3 w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm"
              >
                <option value="">All brands</option>
                {categoryBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </details>

            {category === "computer" && (
              <>
                <details open className="border-b border-gray-200 py-3">
                  <summary className="cursor-pointer list-none font-medium text-gray-800">
                    Condition <ChevronDown className="float-right" size={16} />
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    {[
                      ["all", "All conditions"],
                      ["new", "Brand new"],
                      ["used", "Used - tested"],
                    ].map(([value, label]) => (
                      <label key={value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="condition"
                          checked={condition === value}
                          onChange={() => {
                            setCondition(value);
                            updateQuery({ condition: value });
                          }}
                          className="accent-dvcGreen"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </details>
                <details className="border-b border-gray-200 py-3">
                  <summary className="cursor-pointer list-none font-medium text-gray-800">
                    Component type{" "}
                    <ChevronDown className="float-right" size={16} />
                  </summary>
                  <select
                    value={componentType}
                    onChange={(e) => {
                      setComponentType(e.target.value);
                      updateQuery({ componentType: e.target.value });
                    }}
                    className="mt-3 w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm"
                  >
                    <option value="">All components</option>
                    <option value="memory">RAM / Memory</option>
                    <option value="storage">Storage</option>
                    <option value="peripherals">Peripherals</option>
                    <option value="processor">Processors</option>
                    <option value="graphics">Graphics cards</option>
                  </select>
                </details>
              </>
            )}

            {category === "mobile" && (
              <details open className="border-b border-gray-200 py-3">
                <summary className="cursor-pointer list-none font-medium text-gray-800">
                  Phone type <ChevronDown className="float-right" size={16} />
                </summary>
                <select
                  value={phoneType}
                  onChange={(e) => {
                    setPhoneType(e.target.value);
                    updateQuery({ phoneType: e.target.value });
                  }}
                  className="mt-3 w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm"
                >
                  <option value="">All phones</option>
                  <option value="smartphone">Smartphones</option>
                  <option value="feature-phone">Feature phones</option>
                </select>
              </details>
            )}

            {category === "accessories" && (
              <details open className="border-b border-gray-200 py-3">
                <summary className="cursor-pointer list-none font-medium text-gray-800">
                  Accessory type{" "}
                  <ChevronDown className="float-right" size={16} />
                </summary>
                <select
                  value={accessoryType}
                  onChange={(e) => {
                    setAccessoryType(e.target.value);
                    updateQuery({ accessoryType: e.target.value });
                  }}
                  className="mt-3 w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm"
                >
                  <option value="">All accessories</option>
                  <option value="chargers">Chargers</option>
                  <option value="power-banks">Power banks</option>
                  <option value="audio">Speakers & audio</option>
                  <option value="car-accessories">Car accessories</option>
                </select>
              </details>
            )}

            {category === "stationery" && (
              <>
                <details open className="border-b border-gray-200 py-3">
                  <summary className="cursor-pointer list-none font-medium text-gray-800">
                    Product type{" "}
                    <ChevronDown className="float-right" size={16} />
                  </summary>
                  <select
                    value={subCategory}
                    onChange={(e) => {
                      setSubCategory(e.target.value);
                      updateQuery({ subCategory: e.target.value });
                    }}
                    className="mt-3 w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm"
                  >
                    <option value="">All stationery</option>
                    {STATIONERY_TYPES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </details>
                <details className="border-b border-gray-200 py-3">
                  <summary className="cursor-pointer list-none font-medium text-gray-800">
                    Color <ChevronDown className="float-right" size={16} />
                  </summary>
                  <select
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      updateQuery({ color: e.target.value });
                    }}
                    className="mt-3 w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm"
                  >
                    <option value="">All colors</option>
                    <option value="blue">Blue</option>
                    <option value="black">Black</option>
                    <option value="red">Red</option>
                    <option value="mixed">Multicolor</option>
                  </select>
                </details>
                <details className="border-b border-gray-200 py-3">
                  <summary className="cursor-pointer list-none font-medium text-gray-800">
                    Paper size <ChevronDown className="float-right" size={16} />
                  </summary>
                  <select
                    value={paperSize}
                    onChange={(e) => {
                      setPaperSize(e.target.value);
                      updateQuery({ paperSize: e.target.value });
                    }}
                    className="mt-3 w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm"
                  >
                    <option value="">All sizes</option>
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                    <option value="A5">A5</option>
                  </select>
                </details>
                <details className="border-b border-gray-200 py-3">
                  <summary className="cursor-pointer list-none font-medium text-gray-800">
                    Pack size <ChevronDown className="float-right" size={16} />
                  </summary>
                  <select
                    value={packSize}
                    onChange={(e) => {
                      setPackSize(e.target.value);
                      updateQuery({ packSize: e.target.value });
                    }}
                    className="mt-3 w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm"
                  >
                    <option value="">Any pack size</option>
                    <option value="1">Single item</option>
                    <option value="10">10 items</option>
                    <option value="12">12 items</option>
                    <option value="500">500 sheets</option>
                  </select>
                </details>
              </>
            )}
          </aside>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {CATEGORIES.find((c) => c.value === category)?.label ||
                    "All products"}
                </h2>
                <p className="mt-1 text-sm text-gray-500" aria-live="polite">
                  {loading
                    ? "Loading products..."
                    : `${visibleProducts.length} products found`}
                  {activeFilterCount > 0
                    ? ` · ${activeFilterCount} active filters`
                    : ""}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Sort by
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    updateQuery({ sort: e.target.value });
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </label>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl bg-white p-4"
                  >
                    <div className="aspect-square rounded-lg bg-gray-200" />
                    <div className="mt-3 h-4 rounded bg-gray-200" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-white p-10 text-center text-red-700">
                {error}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white px-6 py-14 text-center">
                <PackageSearch className="mx-auto text-gray-400" size={42} />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No products found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try changing your search or filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-lg bg-[#183D3D] px-4 py-2 text-sm font-semibold text-white"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((product, index) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    index={index}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="mt-10 rounded-xl border border-gray-200 bg-white p-5 sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Need help finding something?
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Contact the DVC team for product information and availability.
            </p>
          </div>
          <Link
            to="/contact-us"
            className="mt-3 inline-flex rounded-lg border border-[#183D3D] px-4 py-2 text-sm font-semibold text-[#183D3D] hover:bg-[#183D3D] hover:text-white sm:mt-0"
          >
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
