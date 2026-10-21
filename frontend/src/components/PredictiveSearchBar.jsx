
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

const API_URL = "/api/products/";

export default function PredictiveSearchBar() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const searchTerm = query.trim();

    if (searchTerm.length < 2) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `${API_URL}?search=${encodeURIComponent(searchTerm)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to fetch products");
        }

        const data = await response.json();

        // Supports a plain array or Django REST Framework pagination.
        const results = Array.isArray(data)
          ? data
          : data.results ?? [];

        setProducts(results.slice(0, 6));
        setOpen(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Product search failed:", error);
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const submitSearch = (event) => {
    event.preventDefault();

    const searchTerm = query.trim();

    if (!searchTerm) return;

    setOpen(false);
    navigate(`/Shop?search=${encodeURIComponent(searchTerm)}`);
  };

  const openProduct = (product) => {
    setOpen(false);

    // Adapt this route to your actual product-detail route.
    navigate(`/product/${product.id}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <form
        onSubmit={submitSearch}
        className="flex h-11 overflow-hidden rounded-lg border border-gray-300 bg-white focus-within:border-[#183d3d] focus-within:ring-2 focus-within:ring-[#183d3d]/20"
      >
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(event.target.value.trim().length >= 2);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setOpen(true);
          }}
          placeholder="Search products..."
          aria-label="Search products"
          aria-expanded={open}
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setProducts([]);
              setOpen(false);
            }}
            aria-label="Clear search"
            className="px-2 text-gray-500 hover:text-gray-900"
          >
            <X size={17} />
          </button>
        )}

        <button
          type="submit"
          aria-label="Search"
          className="flex items-center justify-center bg-[#183d3d] px-4 text-white transition hover:bg-[#245555]"
        >
          <Search size={19} />
        </button>
      </form>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-900 shadow-xl">
          {loading ? (
            <p className="p-4 text-sm text-gray-500">
              Searching products...
            </p>
          ) : products.length > 0 ? (
            <>
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => openProduct(product)}
                  className="flex w-full items-center gap-3 border-b border-gray-100 p-3 text-left transition hover:bg-gray-50"
                >
                  <img
                    src={
                      product.thumbnail ||
                      product.image ||
                      product.image_url ||
                      "/placeholder.png"
                    }
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-md border border-gray-100 object-contain"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {product.title || product.name}
                    </span>
                    <span className="block truncate text-xs text-gray-500">
                      {product.category_name ||
                        product.category?.name ||
                        product.category ||
                        "Product"}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-[#183d3d]">
                      LKR{" "}
                      {Number(product.price || 0).toLocaleString("en-LK")}
                    </span>
                  </span>
                </button>
              ))}

              <button
                type="button"
                onClick={submitSearch}
                className="w-full p-3 text-center text-sm font-semibold text-[#183d3d] hover:bg-gray-50"
              >
                View all results for "{query.trim()}"
              </button>
            </>
          ) : (
            <div className="p-4 text-sm text-gray-600">
              {loading
                ? "Searching products..."
                : "No matching products found. Try another search."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
