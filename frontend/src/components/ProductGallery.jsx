import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallery({
  productName,
  condition,
  images,
  currentImageIndex,
  onSelectImage,
  onPreviousImage,
  onNextImage,
}) {
  const selectedImage = images[currentImageIndex] || "";

  return (
    <div>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gray-100 p-5">
        {selectedImage ? (
          <img
            key={selectedImage}
            src={selectedImage}
            alt={`${productName}, image ${currentImageIndex + 1}`}
            className="h-full w-full object-contain"
          />
        ) : (
          <p className="text-sm text-gray-500">No product image available</p>
        )}

        <span className="absolute left-4 top-4 rounded bg-[#183d3d] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {condition}
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={onPreviousImage}
              aria-label="Show previous product image"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md hover:bg-white"
            >
              <ChevronLeft size={23} />
            </button>
            <button
              type="button"
              onClick={onNextImage}
              aria-label="Show next product image"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md hover:bg-white"
            >
              <ChevronRight size={23} />
            </button>
            <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
              {currentImageIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => onSelectImage(index)}
              aria-label={`View product image ${index + 1}`}
              aria-pressed={currentImageIndex === index}
              className={`h-20 w-20 overflow-hidden rounded-lg border-2 bg-gray-50 p-1 sm:h-24 sm:w-24 ${
                currentImageIndex === index
                  ? "border-[#183d3d]"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <img src={image} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
