"use client";

import { useState, useCallback } from "react";

interface ShareButtonProps {
  title: string;
  url?: string;
  size?: "sm" | "md";
}

export default function ShareButton({ title, url, size = "sm" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleShare = useCallback(async () => {
    // 네이티브 공유 API (모바일)
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        // 사용자 취소 — 무시
      }
    }

    // 폴백: 클립보드 복사
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 실패 시 무시
    }
  }, [title, shareUrl]);

  const iconSize = size === "sm" ? 14 : 16;
  const padding = size === "sm" ? "p-1.5" : "p-2";

  return (
    <button
      onClick={handleShare}
      className={`${padding} rounded-lg text-[var(--text-muted)] hover:text-[#f0b90b] hover:bg-[#f0b90b]/10 transition-all relative`}
      title="공유하기"
    >
      {copied ? (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      )}
    </button>
  );
}
