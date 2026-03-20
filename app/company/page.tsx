"use client";

import { useState, useEffect, useCallback } from "react";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { supabase, type News } from "@/lib/supabase";

const POPULAR_TICKERS = [
  { ticker: "NVDA", name: "엔비디아", color: "#76b900" },
  { ticker: "TSLA", name: "테슬라", color: "#ef4444" },
  { ticker: "SMCI", name: "슈퍼마이크로", color: "#8b5cf6" },
  { ticker: "MSFT", name: "마이크로소프트", color: "#00a4ef" },
  { ticker: "AAPL", name: "애플", color: "#a3a3a3" },
  { ticker: "AMZN", name: "아마존", color: "#ff9900" },
  { ticker: "META", name: "메타", color: "#1877f2" },
  { ticker: "GOOGL", name: "구글", color: "#4285f4" },
];

const IMPORTANCE_STYLES: Record<number, { color: string }> = {
  5: { color: "#ef4444" },
  4: { color: "#f97316" },
  3: { color: "#3b82f6" },
  2: { color: "#6b7280" },
  1: { color: "#4b5563" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function CompanyPage() {
  const { isSubscriber, isAdmin } = useAuth();
  const canView = isSubscriber || isAdmin;
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchTickerNews = useCallback(async (ticker: string) => {
    setLoading(true);
    setNews([]);
    const { data } = await supabase
      .from("news")
      .select("*")
      .contains("tickers", [ticker])
      .order("published_at", { ascending: false })
      .limit(30);
    if (data) setNews(data as News[]);
    setLoading(false);
  }, []);

  const fetchAllCompanyNews = useCallback(async () => {
    setLoading(true);
    const allTickers = POPULAR_TICKERS.map((t) => t.ticker);
    const { data } = await supabase
      .from("news")
      .select("*")
      .overlaps("tickers", allTickers)
      .order("published_at", { ascending: false })
      .limit(50);
    if (data) setNews(data as News[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedTicker) {
      fetchTickerNews(selectedTicker);
    } else {
      fetchAllCompanyNews();
    }
  }, [selectedTicker, fetchTickerNews, fetchAllCompanyNews]);

  const selectedInfo = POPULAR_TICKERS.find((t) => t.ticker === selectedTicker);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
          기업{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
            뉴스
          </span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          주요 기업별 실시간 뉴스를 확인하세요
        </p>

        {/* 티커 필터 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedTicker(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !selectedTicker
                ? "bg-[#f0b90b]/20 text-[#f0b90b] border border-[#f0b90b]/30"
                : "bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)] hover:text-white"
            }`}
          >
            전체
          </button>
          {POPULAR_TICKERS.map((t) => (
            <button
              key={t.ticker}
              onClick={() => setSelectedTicker(t.ticker)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTicker === t.ticker
                  ? "border text-white"
                  : "bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)] hover:text-white"
              }`}
              style={
                selectedTicker === t.ticker
                  ? { backgroundColor: `${t.color}20`, borderColor: `${t.color}50`, color: t.color }
                  : undefined
              }
            >
              ${t.ticker}
            </button>
          ))}
        </div>

        {/* 선택된 기업 헤더 */}
        {selectedInfo && (
          <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black text-white"
              style={{ backgroundColor: selectedInfo.color }}
            >
              {selectedInfo.ticker.slice(0, 2)}
            </div>
            <div>
              <div className="font-bold">{selectedInfo.name}</div>
              <div className="text-xs text-[var(--text-muted)]">${selectedInfo.ticker} 관련 뉴스 {news.length}건</div>
            </div>
          </div>
        )}

        {/* 뉴스 리스트 */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 animate-pulse">
                <div className="h-3 w-24 bg-[var(--border)] rounded mb-3" />
                <div className="h-5 w-3/4 bg-[var(--border)] rounded mb-2" />
                <div className="h-3 w-1/2 bg-[var(--border)] rounded" />
              </div>
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="space-y-3 mb-8">
            {news.map((item) => {
              const text = item.korean_text
                .replace(/^[\u2605\u2606]{1,5}\s*/, "")
                .replace(/^[\[【].*?[\]】]\s*/, "");
              const lines = text.split("\n").filter((l) => l.trim());
              const headline = lines[0] || "";
              const body = lines.slice(1).join("\n");
              const isExpanded = expandedId === item.id;
              const impStyle = IMPORTANCE_STYLES[item.importance] || IMPORTANCE_STYLES[2];

              return (
                <article
                  key={item.id}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden cursor-pointer hover:border-[var(--text-muted)]/30 transition-all"
                >
                  <div style={{ height: "3px", backgroundColor: impStyle.color }} />
                  <div className="p-4">
                    {/* 메타 */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-sm" style={{ color: impStyle.color }}>
                        {"★".repeat(item.importance)}
                        <span style={{ opacity: 0.2 }}>{"★".repeat(5 - item.importance)}</span>
                      </span>
                      {item.tickers?.map((t) => (
                        <span
                          key={t}
                          onClick={(e) => { e.stopPropagation(); setSelectedTicker(t); }}
                          className="text-[11px] font-semibold px-1.5 py-0.5 rounded cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: "rgba(240,185,11,0.1)", color: "#f0b90b" }}
                        >
                          ${t}
                        </span>
                      ))}
                      <span className="text-[11px] text-[var(--text-muted)] ml-auto">
                        {item.source} · {timeAgo(item.published_at)}
                      </span>
                    </div>

                    {/* 헤드라인 */}
                    <h3 className={`text-[15px] font-bold leading-snug ${isExpanded ? "" : "line-clamp-2"}`}>
                      {headline}
                    </h3>

                    {/* 본문 */}
                    {body && canView && (
                      <p className={`mt-2 text-[13px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}>
                        {body}
                      </p>
                    )}
                    {body && !canView && (
                      <div className="relative mt-2 rounded overflow-hidden">
                        <p
                          className="text-[13px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line line-clamp-2 select-none"
                          style={{ filter: "blur(6px)" }}
                        >
                          {body}
                        </p>
                      </div>
                    )}

                    {/* 상세 분석 */}
                    {isExpanded && canView && item.web_detail && (
                      <div className="mt-3 pt-3 border-t border-[var(--border)]">
                        <span className="text-[11px] font-bold text-[#f0b90b] mb-1.5 inline-block">상세 분석</span>
                        <p className="text-[13px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                          {item.web_detail}
                        </p>
                      </div>
                    )}

                    {!isExpanded && (body || item.web_detail) && canView && (
                      <span className="text-[11px] text-[#f0b90b] mt-1.5 inline-block">펼쳐서 더 보기</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-sm">
              {selectedTicker ? `$${selectedTicker} 관련 뉴스가 없습니다` : "기업 뉴스가 없습니다"}
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
