"use client";

import { useEffect, useState, useCallback } from "react";
import type { News } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

function ModalOgImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (error) return null;
  return (
    <div className="w-full max-h-80 overflow-hidden bg-black/20">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

const THEME_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  "실적":     { icon: "📊", color: "#8b5cf6", label: "실적" },
  "경제지표": { icon: "🏦", color: "#3b82f6", label: "경제지표" },
  "연준":     { icon: "🏛️", color: "#3b82f6", label: "연준" },
  "지정학":   { icon: "🌍", color: "#ef4444", label: "지정학" },
  "정치":     { icon: "🏛️", color: "#ef4444", label: "정치" },
  "원자재":   { icon: "⚡", color: "#f97316", label: "원자재" },
  "테크":     { icon: "💻", color: "#22c55e", label: "테크" },
  "반도체":   { icon: "🔧", color: "#22c55e", label: "반도체" },
  "암호화폐": { icon: "₿", color: "#eab308", label: "암호화폐" },
  "기타":     { icon: "📰", color: "#6b7280", label: "기타" },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function NewsDetailModal({ news, onClose }: { news: News; onClose: () => void }) {
  const { isSubscriber, isAdmin, canViewVip, freeNewsViews, useFreeNewsView, user } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [consuming, setConsuming] = useState(false);
  const isPremiumNews = news.importance >= 4;
  const canView = !isPremiumNews || isSubscriber || isAdmin || unlocked;

  const handleUseFreeNewsView = useCallback(async () => {
    if (consuming) return;
    setConsuming(true);
    const ok = await useFreeNewsView();
    if (ok) setUnlocked(true);
    setConsuming(false);
  }, [consuming, useFreeNewsView]);
  const themeConf = THEME_CONFIG[news.theme || "기타"] || THEME_CONFIG["기타"];

  const text = news.korean_text
    .replace(/^[\u2605\u2606]{1,5}\s*\n?/, "")
    .replace(/^[\[【].*?[\]】]\s*/, "");
  const lines = text.split("\n").filter((l) => l.trim());
  const headline = lines[0] || "";
  const body = lines.slice(1).join("\n");

  // ESC로 닫기 + body 스크롤 잠금
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-none md:max-w-3xl mx-0 md:mx-4 my-4 md:my-16 rounded-none md:rounded-2xl overflow-hidden"
        style={{ backgroundColor: "var(--card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 테마 컬러 바 */}
        <div style={{ height: "4px", background: themeConf.color }} />

        {/* OG Image */}
        {news.og_image && <ModalOgImage src={news.og_image} alt={headline} />}

        {/* 닫기 버튼 */}
        <button onClick={onClose} className="absolute top-3 right-3 md:top-4 md:right-4 z-10 w-10 h-10 md:w-8 md:h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
        </button>

        <div className="p-4 md:p-8">
          {/* 테마 + 중요도 + 시간 */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${themeConf.color}20`, color: themeConf.color }}>
              {themeConf.icon} {themeConf.label}
            </span>
            <span className="text-sm" style={{ color: "#f0b90b" }}>
              {"★".repeat(news.importance)}
              <span style={{ opacity: 0.2 }}>{"★".repeat(5 - news.importance)}</span>
            </span>
            <span className="text-xs text-[var(--text-muted)]">{news.source} · {timeAgo(news.published_at)}</span>
          </div>

          {/* 헤드라인 */}
          <h1 className="text-xl md:text-2xl font-bold leading-snug mb-4">{headline}</h1>

          {/* 티커 */}
          {news.tickers?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-5">
              {news.tickers.map((t) => (
                <span key={t} className="text-sm font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(240,185,11,0.1)", color: "#f0b90b" }}>
                  ${t}
                </span>
              ))}
            </div>
          )}

          {/* 본문 */}
          {body && canView && (
            <div className="mb-6">
              <p className="text-[15px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{body}</p>
            </div>
          )}
          {body && !canView && (
            <div className="relative mb-6 rounded-lg overflow-hidden">
              <p className="text-[15px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line select-none" style={{ filter: "blur(8px)" }}>{body}</p>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--card)]/60">
                {!user ? (
                  <>
                    <p className="text-sm text-[var(--text-muted)] text-center">회원가입만 하면 <strong className="text-[#3b82f6]">뉴스 5건 무료</strong> 열람!</p>
                    <a href="/#subscribe" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white text-sm font-bold hover:opacity-90 shadow-lg">
                      회원가입하기
                    </a>
                  </>
                ) : freeNewsViews > 0 ? (
                  <button
                    onClick={handleUseFreeNewsView}
                    disabled={consuming}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white text-sm font-bold hover:opacity-90 shadow-lg disabled:opacity-50"
                  >
                    {consuming ? "처리 중..." : `무료 열람 사용 (${freeNewsViews}건 남음)`}
                  </button>
                ) : (
                  <a href="/#subscribe" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black text-sm font-bold hover:opacity-90 shadow-lg">
                    🔒 구독하고 전체 내용 보기
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 상세 분석 */}
          {news.web_detail && canView && (
            <div className="border-t border-[var(--border)] pt-5">
              <h2 className="text-base font-bold text-[#f0b90b] mb-4">📊 상세 분석</h2>
              <div className="text-[15px] text-[var(--text)] leading-[1.8] whitespace-pre-line">{news.web_detail}</div>
            </div>
          )}
          {news.web_detail && !canView && (
            <div className="border-t border-[var(--border)] pt-5 relative rounded-lg overflow-hidden">
              <h2 className="text-base font-bold text-[#f0b90b] mb-4">📊 상세 분석</h2>
              <p className="text-[15px] leading-[1.8] whitespace-pre-line select-none line-clamp-4" style={{ filter: "blur(8px)" }}>{news.web_detail}</p>
              <div className="absolute inset-0 top-10 flex flex-col items-center justify-center gap-3 bg-[var(--card)]/60">
                {!user ? (
                  <>
                    <p className="text-sm text-[var(--text-muted)] text-center">회원가입만 하면 <strong className="text-[#3b82f6]">뉴스 5건 무료</strong> 열람!</p>
                    <a href="/#subscribe" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white text-sm font-bold hover:opacity-90 shadow-lg">
                      회원가입하기
                    </a>
                  </>
                ) : freeNewsViews > 0 ? (
                  <button
                    onClick={handleUseFreeNewsView}
                    disabled={consuming}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white text-sm font-bold hover:opacity-90 shadow-lg disabled:opacity-50"
                  >
                    {consuming ? "처리 중..." : `무료 열람 사용 (${freeNewsViews}건 남음)`}
                  </button>
                ) : (
                  <a href="/#subscribe" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black text-sm font-bold hover:opacity-90 shadow-lg">
                    🔒 구독하고 상세 분석 보기
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
