"use client";

import type { News } from "@/lib/supabase";

const THEME_LABELS: Record<string, string> = {
  earnings: "실적",
  macro: "매크로",
  geopolitics: "지정학",
  crypto: "암호화폐",
  commodities: "원자재",
  tech: "기술",
  ma: "M&A",
  regulation: "규제",
  etc: "기타",
};

const IMPORTANCE_LABEL: Record<number, string> = {
  5: "긴급",
  4: "속보",
  3: "주요",
  2: "참고",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function NewsCard({ news }: { news: News }) {
  const badgeClass = `badge-${news.importance}`;
  const theme = news.theme ? THEME_LABELS[news.theme] || news.theme : "";
  const impLabel = IMPORTANCE_LABEL[news.importance] || "";

  // korean_text에서 별 표시 제거
  const text = news.korean_text
    .replace(/^[★☆]{5}\s*/, "")
    .replace(/^[\[【].*?[\]】]\s*/, "");

  // 첫 줄과 나머지 분리
  const lines = text.split("\n").filter((l) => l.trim());
  const headline = lines[0] || "";
  const body = lines.slice(1).join("\n");

  const tweetUrl = news.tweet_id
    ? `https://x.com/US_sokbo/status/${news.tweet_id}`
    : null;

  return (
    <article className="news-card border-b border-[var(--border)] px-4 py-4 hover:bg-[var(--card-hover)] transition-colors">
      <div className="flex items-start gap-3">
        {/* 중요도 뱃지 */}
        <div
          className={`${badgeClass} shrink-0 mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold text-white`}
        >
          {impLabel}
        </div>

        <div className="min-w-0 flex-1">
          {/* 헤드라인 */}
          <h3 className="text-[15px] font-semibold leading-snug break-words">
            {headline}
          </h3>

          {/* 본문 (다이제스트 등) */}
          {body && (
            <p className="mt-1.5 text-[13px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
              {body}
            </p>
          )}

          {/* 메타 */}
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            {theme && (
              <span className="px-1.5 py-0.5 rounded bg-[var(--border)]">
                {theme}
              </span>
            )}
            {news.tickers?.length > 0 &&
              news.tickers.slice(0, 3).map((t) => (
                <span key={t} className="text-[var(--accent)]">
                  ${t}
                </span>
              ))}
            <span>{timeAgo(news.published_at)}</span>
            {news.source && <span className="opacity-60">{news.source}</span>}
            {tweetUrl && (
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline ml-auto"
              >
                X에서 보기
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
