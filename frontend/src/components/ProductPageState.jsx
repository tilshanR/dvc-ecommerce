import { AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export function ProductLoading() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4" aria-live="polite">
      <div className="text-center">
        <RefreshCw size={32} className="mx-auto animate-spin text-[#183d3d]" />
        <p className="mt-4 font-medium text-gray-700">Loading product details...</p>
      </div>
    </main>
  );
}

export function ProductLoadError({ error, onRetry }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <AlertCircle size={42} className="text-red-500" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Unable to load product</h1>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        {error || "This product could not be found."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-md bg-[#183d3d] px-5 py-3 font-semibold text-white hover:bg-[#245454]"
      >
        Try again
      </button>
      <Link to="/" className="mt-4 text-sm font-medium text-[#183d3d] underline">
        Back to home
      </Link>
    </main>
  );
}
