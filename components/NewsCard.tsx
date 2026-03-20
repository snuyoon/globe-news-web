"use client";

import { useState } from "react";
import type { News } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "\uBC29\uAE08 \uC804";
  if (mins < 60) return `${mins}\uBD84 \uC804`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}\uC2DC\uAC04 \uC804`;
  const days = Math.floor(hours / 24);
  return `${days}\uC77C \uC804`;
}

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
  const [expanded, setExpanded] = useState(false);
  const { isSubscriber, isAdmin } = useAuth();
  const canView = isSubscriber || isAdmin;

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
      onClick={() => setExpanded(!expanded)}
    >
      {/* Theme color bar */}
      <div style={{ height: "4px", background: themeConf.color }} />

      <div className="p-4">
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
          <div className="relative mt-2">
            <p
              className="text-[13px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line line-clamp-3 select-none"
              style={{ filter: "blur(6px)", WebkitFilter: "blur(6px)" }}
              aria-hidden="true"
            >
              {body}
            </p>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[13px] text-[var(--text-muted)] font-medium mb-1">
                내용을 보시려면 구독해주세요
              </p>
              <a
                href="/#subscribe"
                onClick={(e) => e.stopPropagation()}
                className="text-[12px] text-[#f0b90b] font-bold hover:underline"
              >
                구독하기
              </a>
            </div>
          </div>
        )}

        {/* Expand hint */}
        {body && canView && !expanded && lines.length > 4 && (
          <span className="text-[11px] text-[var(--accent)] mt-1 inline-block">
            펼쳐서 더 보기
          </span>
        )}
        {expanded && body && canView && (
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
        <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--text-muted)] flex-wrap">
          {news.source && <span className="opacity-70">{news.source}</span>}
          <span>{timeAgo(news.published_at)}</span>
          {tweetUrl && (
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              X에서 보기 &rarr;
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
