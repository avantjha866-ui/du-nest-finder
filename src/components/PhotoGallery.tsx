import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

interface PhotoGalleryProps {
  photos: string[];
  name: string;
}

export function PhotoGallery({ photos, name }: PhotoGalleryProps) {
  const [idx, setIdx] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-48 bg-secondary rounded-xl flex flex-col items-center justify-center text-muted-foreground mb-4">
        <ImageOff size={28} className="mb-2 opacity-40" />
        <span className="text-xs">No photos yet</span>
      </div>
    );
  }

  const prev = () => setIdx((i) => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <div className="relative w-full h-52 rounded-xl overflow-hidden mb-4 bg-secondary group">
      <img
        src={photos[idx]}
        alt={`${name} photo ${idx + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
      />

      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={16} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>

          {/* Counter */}
          <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
            {idx + 1} / {photos.length}
          </span>
        </>
      )}
    </div>
  );
}
