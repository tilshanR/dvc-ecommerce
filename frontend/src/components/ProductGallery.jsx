import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

export default function ProductGallery({
  productName,
  condition,
  images = [],
  currentImageIndex,
  onSelectImage,
  onPreviousImage,
  onNextImage,
}) {
  const selectedImage = images[currentImageIndex] || "";

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Container */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
        {selectedImage ? (
          <img
            key={selectedImage}
            src={selectedImage}
            alt={`${productName} - View ${currentImageIndex + 1}`}
            className="h-full w-full object-contain transition-opacity duration-300"
          />
        ) : (
          /* UX FIX: Replaced simple text with a visual empty state using an icon */
          <div className="flex flex-col items-center text-gray-400">
            <ImageOff size={42} strokeWidth={1.5} className="mb-3 opacity-60" />
            <p className="text-sm font-medium">No image available</p>
          </div>
        )}

        {/* UX FIX: Conditionally render the badge only if condition exists. 
            Added pointer-events-none so it doesn't interrupt mouse interactions or feel clickable. */}
        {condition && (
          <span className="pointer-events-none absolute left-4 top-4 rounded bg-[#183d3d] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
            {condition}
          </span>
        )}

        {/* Navigation Arrows (Only show if there are multiple images) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={onPreviousImage}
              aria-label="Show previous product image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105 focus-visible:outline-[#183d3d]"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={onNextImage}
              aria-label="Show next product image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105 focus-visible:outline-[#183d3d]"
            >
              <ChevronRight size={20} />
            </button>

            <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {currentImageIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => onSelectImage(index)}
              aria-label={`View product image ${index + 1}`}
              aria-pressed={currentImageIndex === index}
              className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 bg-gray-50 p-1 sm:h-24 sm:w-24 transition-all duration-200 ${
                currentImageIndex === index
                  ? "border-[#183d3d] shadow-sm ring-1 ring-[#183d3d] ring-offset-1"
                  : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={image}
                alt=""
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
