"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { News } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import NewsScrapButton from "./NewsScrapButton";
import ShareButton from "./ShareButton";
import { grantXp } from "@/lib/xp";
import { timeAgo } from "@/lib/utils";

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

const SECTION_META: Record<string, { icon: string; color: string }> = {
  "배경": { icon: "📋", color: "#3b82f6" },
  "영향": { icon: "💥", color: "#ef4444" },
  "관련": { icon: "🔗", color: "#22c55e" },
  "전망": { icon: "🔮", color: "#a855f7" },
};



function parseWebDetail(text: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const pattern = /^(배경|영향|관련|전망)\s*[:：]/gm;
  const matches = [...text.matchAll(pattern)];

  if (matches.length === 0) {
    return [{ title: "", content: text }];
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    sections.push({
      title: matches[i][1],
      content: text.slice(start, end).trim(),
    });
  }

  return sections;
}

export default function NewsDetailModal({ news, onClose }: { news: News; onClose: () => void }) {
  const { isSubscriber, isAdmin, canViewVip, freeNewsViews, useFreeNewsView, user } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [consuming, setConsuming] = useState(false);
  const [showSubOnly, setShowSubOnly] = useState(false);
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

  const detailSections = news.web_detail ? parseWebDetail(news.web_detail) : [];

  // 열람 XP 적립 (1회)
  const xpGranted = useRef(false);
  useEffect(() => {
    if (user && !xpGranted.current) {
      xpGranted.current = true;
      grantXp(user.id, "news_view");
    }
  }, [user]);

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
                    구독하고 전체 내용 보기
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 상세 분석 — 카드형 */}
          {news.web_detail && canView && (
            <div className="mt-2 mb-2">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[var(--border)]">
                <span className="text-lg">📊</span>
                <h2 className="text-base font-bold text-[#f0b90b]">상세 분석</h2>
              </div>

              {detailSections.length === 1 && !detailSections[0].title ? (
                /* 섹션 구분 없는 경우 — 기존처럼 표시 */
                <div className="text-[15px] text-[var(--text)] leading-[1.8] whitespace-pre-line">
                  {detailSections[0].content}
                </div>
              ) : (
                /* 섹션별 카드 */
                <div className="flex flex-col gap-4">
                  {detailSections.map((section, i) => {
                    const meta = SECTION_META[section.title] || { icon: "📌", color: "#6b7280" };
                    return (
                      <div
                        key={i}
                        className="rounded-xl p-4 md:p-5"
                        style={{ backgroundColor: "var(--bg)", borderLeft: `3px solid ${meta.color}` }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-base">{meta.icon}</span>
                          <h3 className="text-sm font-bold" style={{ color: meta.color }}>
                            {section.title}
                          </h3>
                        </div>
                        <p className="text-[14px] text-[var(--text-muted)] leading-[1.8] whitespace-pre-line">
                          {section.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {news.web_detail && !canView && (
            <div className="relative rounded-xl overflow-hidden mt-2 mb-2 p-5" style={{ backgroundColor: "var(--bg)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📊</span>
                <h2 className="text-base font-bold text-[#f0b90b]">상세 분석</h2>
              </div>
              <p className="text-[15px] leading-[1.8] whitespace-pre-line select-none line-clamp-4" style={{ filter: "blur(8px)" }}>{news.web_detail}</p>
              <div className="absolute inset-0 top-10 flex flex-col items-center justify-center gap-3 bg-[var(--bg)]/80">
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
                    구독하고 상세 분석 보기
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 하단 액션 바 */}
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ShareButton title={headline} size="md" />
                <NewsScrapButton newsId={news.id} />
                {news.url && (
                  (isSubscriber || isAdmin) ? (
                    <a href={news.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                      원문 보기
                    </a>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowSubOnly(true); setTimeout(() => setShowSubOnly(false), 2500); }}
                      className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                      원문 보기
                    </button>
                  )
                )}
              </div>
              <button
                onClick={onClose}
                className="text-xs text-[var(--text-muted)] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--bg)]"
              >
                닫기
              </button>
            </div>

            {/* 구독자 전용 토스트 */}
            {showSubOnly && (
              <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#f0b90b]/10 to-[#ef6d09]/10 border border-[#f0b90b]/20">
                <span className="text-sm">🔒</span>
                <span className="text-xs text-[#f0b90b] font-medium">구독자에게만 제공되는 기능입니다</span>
                <a href="/#subscribe" onClick={(e) => e.stopPropagation()} className="ml-auto text-xs text-[#f0b90b] font-bold hover:underline">구독하기</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
