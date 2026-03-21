"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./AuthProvider";

interface CardViewerProps {
  title: string;
  slideCount: number;
  baseUrl: string;
  onClose: () => void;
}

export default function CardViewer({ title, slideCount, baseUrl, onClose }: CardViewerProps) {
  const [current, setCurrent] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { isAdmin, isSubscriber, freeViews, useFreeView } = useAuth();
  const needsCredit = !isAdmin && !isSubscriber && !unlocked;

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = window.location.href;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const slides = Array.from({ length: slideCount }, (_, i) => `${baseUrl}/slide_${i + 1}.png`);

  const goPrev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);

  const goNext = useCallback(() => {
    if (current === 0 && needsCredit) {
      if (freeViews <= 0) {
        setShowSubscribeModal(true);
        return;
      }
      setShowCreditModal(true);
      return;
    }
    setCurrent((c) => Math.min(slideCount - 1, c + 1));
  }, [current, needsCredit, freeViews, slideCount]);

  const handleConfirmCredit = useCallback(async () => {
    const ok = await useFreeView();
    if (ok) {
      setUnlocked(true);
      setShowCreditModal(false);
      setCurrent(1);
    } else {
      setShowCreditModal(false);
      onClose();
    }
  }, [useFreeView, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showCreditModal) setShowCreditModal(false);
        else onClose();
      }
      if (!showCreditModal) {
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goPrev, goNext, showCreditModal]);

  // Prevent body scroll
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

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

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
      {/* Close + Share */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={handleShare}
          className="h-10 px-3 flex items-center justify-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          aria-label="Share"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {copied ? "복사됨!" : "공유"}
        </button>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xl transition-colors"
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-4 right-32 z-10">
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
        <img
          src={slides[current]}
          alt={`Slide ${current + 1} of ${slideCount}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg select-none"
          draggable={false}
        />
      </div>

      {/* Bottom indicator */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3 z-10">
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (i > 0 && needsCredit) {
                  if (freeViews <= 0) return;
                  setShowCreditModal(true);
                  return;
                }
                setCurrent(i);
              }}
              className={`rounded-full transition-all ${
                i === current
                  ? "w-6 h-2 bg-[#f0b90b]"
                  : i > 0 && needsCredit
                    ? "w-2 h-2 bg-white/15"
                    : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <span className="text-white/60 text-xs">
          {current + 1} / {slideCount}
        </span>
      </div>

      {/* 크레딧 차감 확인 모달 */}
      {showCreditModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a1a2e] border border-[var(--border)] rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <span className="text-3xl mb-2 block">📖</span>
              <h3 className="text-base font-bold text-white mb-1">무료 열람권 사용</h3>
              <p className="text-sm text-[var(--text-muted)]">
                다음 슬라이드부터 열람권이 차감됩니다
              </p>
            </div>
            <div className="bg-[var(--bg)] rounded-xl p-4 mb-4 text-center">
              <p className="text-2xl font-bold text-[#f0b90b]">{freeViews}건 <span className="text-base font-normal text-[var(--text-muted)]">남음</span></p>
              <p className="text-xs text-[var(--text-muted)] mt-1">이 카드뉴스를 보면 1건이 차감됩니다</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreditModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-muted)] bg-[var(--bg)] hover:bg-[var(--border)] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmCredit}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] hover:opacity-90 transition-opacity"
              >
                열람하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 구독 안내 모달 (크레딧 0) */}
      {showSubscribeModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a1a2e] border border-[var(--border)] rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <span className="text-3xl mb-2 block">🔒</span>
              <h3 className="text-base font-bold text-white mb-1">무료 체험이 끝났습니다</h3>
              <p className="text-sm text-[var(--text-muted)]">
                구독하면 모든 카드뉴스를 무제한으로 볼 수 있어요
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowSubscribeModal(false); onClose(); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-muted)] bg-[var(--bg)] hover:bg-[var(--border)] transition-colors"
              >
                닫기
              </button>
              <a
                href="/#subscribe"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] hover:opacity-90 transition-opacity text-center"
              >
                구독하기
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
