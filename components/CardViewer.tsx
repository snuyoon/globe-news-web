"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface CardViewerProps {
  title: string;
  slideCount: number;
  baseUrl: string;
  onClose: () => void;
}

export default function CardViewer({ title, slideCount, baseUrl, onClose }: CardViewerProps) {
  const [current, setCurrent] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  const slides = Array.from({ length: slideCount }, (_, i) => `${baseUrl}/slide_${i + 1}.png`);

  const goPrev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const goNext = useCallback(() => setCurrent((c) => Math.min(slideCount - 1, c + 1)), []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goPrev, goNext]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Preload adjacent images
  useEffect(() => {
    const toPreload = [current - 1, current, current + 1].filter(
      (i) => i >= 0 && i < slideCount
    );
    toPreload.forEach((i) => {
      if (!loadedImages.has(i)) {
        const img = new Image();
        img.src = slides[i];
        img.onload = () => setLoadedImages((prev) => new Set(prev).add(i));
      }
    });
  }, [current, slideCount, slides, loadedImages]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only trigger swipe if horizontal movement > vertical and > 50px
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  // Click overlay to close (but not inner content)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      style={{ touchAction: "none" }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xl transition-colors"
        aria-label="Close"
      >
        &times;
      </button>

      {/* Title */}
      <div className="absolute top-4 left-4 right-16 z-10">
        <h2 className="text-white text-sm md:text-base font-bold truncate">{title}</h2>
      </div>

      {/* Left arrow */}
      {current > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white text-xl md:text-2xl transition-colors"
          aria-label="Previous slide"
        >
          &#8249;
        </button>
      )}

      {/* Right arrow */}
      {current < slideCount - 1 && (
        <button
          onClick={goNext}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white text-xl md:text-2xl transition-colors"
          aria-label="Next slide"
        >
          &#8250;
        </button>
      )}

      {/* Slide image */}
      <div
        className="relative w-full h-full flex items-center justify-center px-14 md:px-20 py-16"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slides[current]}
          alt={`Slide ${current + 1} of ${slideCount}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg select-none"
          draggable={false}
        />
      </div>

      {/* Bottom indicator */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3 z-10">
        {/* Dots */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? "w-6 h-2 bg-[#f0b90b]"
                  : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        {/* Counter text */}
        <span className="text-white/60 text-xs">
          {current + 1} / {slideCount}
        </span>
      </div>
    </div>
  );
}
