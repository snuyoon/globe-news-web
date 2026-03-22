"use client";

import { useState } from "react";
import type { News } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import NewsScrapButton from "./NewsScrapButton";
import ShareButton from "./ShareButton";
import { timeAgo } from "@/lib/utils";

function OgImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (error) return null;
  return (
    <div className="w-full h-32 md:h-48 overflow-hidden bg-black/20">
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
  "규제":     { icon: "⚖️", color: "#6366f1", label: "규제" },
  "M&A":     { icon: "🤝", color: "#14b8a6", label: "M&A" },
  "기타":     { icon: "📰", color: "#6b7280", label: "기타" },
  "etc":     { icon: "📰", color: "#6b7280", label: "기타" },
};

const IMPORTANCE_STYLES: Record<number, { color: string; glow: string }> = {
  5: { color: "#ef4444", glow: "0 0 12px rgba(239,68,68,0.5)" },
  4: { color: "#f97316", glow: "none" },
  3: { color: "#3b82f6", glow: "none" },
  2: { color: "#6b7280", glow: "none" },
  1: { color: "#4b5563", glow: "none" },
};



function renderStars(importance: number) {
  const style = IMPORTANCE_STYLES[importance] || IMPORTANCE_STYLES[1];
  return (
    <span style={{ color: style.color, textShadow: style.glow, fontSize: "14px" }}>
      {"\u2605".repeat(importance)}
      <span style={{ opacity: 0.2 }}>{"\u2605".repeat(5 - importance)}</span>
    </span>
  );
}

export default function NewsCard({ news, index }: { news: News; index: number }) {
  const expanded = false; // 모달로 대체
  const { isSubscriber, isAdmin, freeNewsViews, user, canViewVip } = useAuth();
  const isPremiumNews = news.importance >= 4;
  const canView = !isPremiumNews || isSubscriber || isAdmin || (!!user && freeNewsViews > 0);

  const themeConf = THEME_CONFIG[news.theme || "기타"] || THEME_CONFIG["기타"];

  const text = news.korean_text
    .replace(/^[\u2605\u2606]{1,5}\s*/, "")
    .replace(/^[\[【].*?[\]】]\s*/, "");

  const lines = text.split("\n").filter((l) => l.trim());
  const headline = lines[0] || "";
  const body = lines.slice(1).join("\n");

  const tweetUrl = news.tweet_id
    ? `https://x.com/US_sokbo/status/${news.tweet_id}`
    : null;

  const isUrgent = news.importance >= 5;

  return (
    <article
      className="news-card rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg"
      style={{
        backgroundColor: "var(--card)",
        animationDelay: `${Math.min(index * 50, 500)}ms`,
        animationFillMode: "both",
        ...(isUrgent ? { boxShadow: "0 0 20px rgba(239,68,68,0.15)" } : {}),
      }}
      // 클릭은 부모(NewsFeed)에서 모달로 처리
    >
      {/* Theme color bar */}
      <div style={{ height: "4px", background: themeConf.color }} />

      {/* OG Image thumbnail */}
      {news.og_image && <OgImage src={news.og_image} alt={headline} />}

      <div className="p-3 md:p-4">
        {/* Top row: theme + importance */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ backgroundColor: `${themeConf.color}20` }}
            >
              {themeConf.icon}
            </span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${themeConf.color}20`,
                color: themeConf.color,
              }}
            >
              {themeConf.label}
            </span>
          </div>
          {renderStars(news.importance)}
        </div>

        {/* Headline */}
        <h3
          className={`text-[15px] md:text-[16px] font-bold leading-snug break-words ${
            expanded ? "" : "line-clamp-2"
          }`}
        >
          {headline}
        </h3>

        {/* Body preview / full */}
        {body && canView && (
          <p
            className={`mt-2 text-[13px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line ${
              expanded ? "" : "line-clamp-3"
            }`}
          >
            {body}
          </p>
        )}

        {/* 비구독자 모자이크 */}
        {body && !canView && (
          <div className="relative mt-3 rounded-lg overflow-hidden">
            <p
              className="text-[13px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line line-clamp-3 select-none"
              style={{ filter: "blur(8px)", WebkitFilter: "blur(8px)" }}
              aria-hidden="true"
            >
              {body}
            </p>
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--card)]/60">
              {!user ? (
                <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white text-[13px] font-bold shadow-lg">
                  회원가입하면 5건 무료
                </span>
              ) : (
                <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black text-[13px] font-bold shadow-lg">
                  🔒 구독하고 전체 내용 보기
                </span>
              )}
            </div>
          </div>
        )}

        {/* Web detail (subscriber only, expanded) */}
        {expanded && canView && news.web_detail && (
          <div className="mt-4 pt-3 border-t border-[var(--border)]">
            <span className="text-[12px] font-bold text-[var(--accent)] mb-2 inline-block">
              상세 분석
            </span>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
              {news.web_detail}
            </p>
          </div>
        )}

        {/* Web detail teaser for non-subscribers */}
        {expanded && !canView && news.web_detail && (
          <div className="relative mt-4 pt-3 border-t border-[var(--border)] rounded-lg overflow-hidden">
            <span className="text-[12px] font-bold text-[var(--accent)] mb-2 inline-block">
              상세 분석
            </span>
            <p
              className="text-[13px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line line-clamp-3 select-none"
              style={{ filter: "blur(8px)", WebkitFilter: "blur(8px)" }}
              aria-hidden="true"
            >
              {news.web_detail}
            </p>
            <div className="absolute inset-0 top-8 flex items-center justify-center bg-[var(--card)]/60">
              <a
                href="/#subscribe"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black text-[13px] font-bold hover:opacity-90 transition-opacity shadow-lg"
              >
                구독하고 상세 분석 보기
              </a>
            </div>
          </div>
        )}

        {/* Expand hint */}
        {canView && !expanded && (body || news.web_detail) && (
          <span className="text-[11px] text-[var(--accent)] mt-1 inline-block">
            펼쳐서 더 보기
          </span>
        )}
        {!canView && !expanded && body && (
          <span className="text-[11px] text-[var(--accent)] mt-1 inline-block">
            펼쳐서 더 보기
          </span>
        )}
        {expanded && (body || news.web_detail) && (
          <span className="text-[11px] text-[var(--accent)] mt-1 inline-block">
            접기
          </span>
        )}

        {/* Tickers */}
        {news.tickers?.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {news.tickers.slice(0, 5).map((t) => (
              <span
                key={t}
                className="text-[12px] font-semibold px-2 py-0.5 rounded-md"
                style={{
                  backgroundColor: "rgba(240,185,11,0.1)",
                  color: "#f0b90b",
                }}
              >
                ${t}
              </span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-2 flex-wrap">
            {news.source && <span className="opacity-70">{news.source}</span>}
            <span>{timeAgo(news.published_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <ShareButton title={headline} />
            <NewsScrapButton newsId={news.id} />
          </div>
        </div>
      </div>
    </article>
  );
}
