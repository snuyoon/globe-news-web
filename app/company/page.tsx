"use client";

import { useState, useEffect, useCallback } from "react";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { supabase, type News } from "@/lib/supabase";
import NewsDetailModal from "@/components/NewsDetailModal";

const TICKERS = [
  { ticker: "NVDA", name: "엔비디아", color: "#76b900" },
  { ticker: "TSLA", name: "테슬라", color: "#ef4444" },
  { ticker: "SMCI", name: "슈퍼마이크로", color: "#8b5cf6" },
  { ticker: "MSFT", name: "마이크로소프트", color: "#00a4ef" },
  { ticker: "AAPL", name: "애플", color: "#a3a3a3" },
  { ticker: "AMZN", name: "아마존", color: "#ff9900" },
  { ticker: "META", name: "메타", color: "#1877f2" },
  { ticker: "GOOGL", name: "구글", color: "#4285f4" },
];

const IMPORTANCE_COLORS: Record<number, string> = {
  5: "#ef4444", 4: "#f97316", 3: "#3b82f6", 2: "#6b7280", 1: "#4b5563",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export default function CompanyPage() {
  const { isSubscriber, isAdmin } = useAuth();
  const canView = isSubscriber || isAdmin;
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [showVipModal, setShowVipModal] = useState(false);

  const fetchNews = useCallback(async (ticker: string | null) => {
    setLoading(true);
    setNews([]);
    let query = supabase.from("news").select("*").order("published_at", { ascending: false }).limit(30);

    if (ticker) {
      query = query.contains("tickers", [ticker]);
    } else {
      query = query.overlaps("tickers", TICKERS.map((t) => t.ticker));
    }

    const { data } = await query;
    if (data) setNews(data as News[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNews(selectedTicker);
  }, [selectedTicker, fetchNews]);

  const handleCardClick = (item: News) => {
    if (!canView) { setShowVipModal(true); return; }
    setSelectedNews(item);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
          기업{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
            분석
          </span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          주요 기업별 실시간 뉴스를 확인하세요
        </p>

        {/* 티커 탭 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedTicker(null)}
            className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all text-left ${
              !selectedTicker
                ? "bg-gradient-to-r from-[#f0b90b]/10 to-[#ef6d09]/10 border-[#f0b90b]/30"
                : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--text-muted)]/30"
            }`}
          >
            <span className={`text-sm font-bold ${!selectedTicker ? "text-[#f0b90b]" : "text-[var(--text)]"}`}>
              전체
            </span>
            <p className="text-[10px] text-[var(--text-muted)]">모든 기업 뉴스</p>
          </button>
          {TICKERS.map((t) => (
            <button
              key={t.ticker}
              onClick={() => setSelectedTicker(t.ticker)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all text-left ${
                selectedTicker === t.ticker
                  ? "border-[#f0b90b]/30"
                  : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--text-muted)]/30"
              }`}
              style={selectedTicker === t.ticker ? { backgroundColor: `${t.color}10`, borderColor: `${t.color}40` } : undefined}
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-bold ${selectedTicker === t.ticker ? "" : "text-[var(--text)]"}`} style={selectedTicker === t.ticker ? { color: t.color } : undefined}>
                  ${t.ticker}
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">{t.name}</p>
            </button>
          ))}
        </div>

        {/* 뉴스 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {loading ? (
            <>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden animate-pulse">
                  <div className="h-1 bg-[var(--border)]" />
                  <div className="p-5 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-4 w-16 bg-[var(--border)] rounded" />
                      <div className="h-4 w-12 bg-[var(--border)] rounded" />
                    </div>
                    <div className="h-5 w-3/4 bg-[var(--border)] rounded" />
                    <div className="h-4 w-full bg-[var(--border)] rounded" />
                    <div className="h-3 w-1/3 bg-[var(--border)] rounded" />
                  </div>
                </div>
              ))}
            </>
          ) : news.length > 0 ? (
            news.map((item) => {
              const text = item.korean_text
                .replace(/^[\u2605\u2606]{1,5}\s*/, "")
                .replace(/^[\[【].*?[\]】]\s*/, "");
              const lines = text.split("\n").filter((l) => l.trim());
              const headline = lines[0] || "";
              const body = lines.slice(1).join("\n");
              const impColor = IMPORTANCE_COLORS[item.importance] || IMPORTANCE_COLORS[2];

              return (
                <button
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="group block bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[#f0b90b]/40 transition-all hover:scale-[1.02] text-left w-full"
                >
                  <div style={{ height: "3px", backgroundColor: impColor }} />

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-sm" style={{ color: impColor }}>
                        {"★".repeat(item.importance)}
                        <span style={{ opacity: 0.2 }}>{"★".repeat(5 - item.importance)}</span>
                      </span>
                      {item.tickers?.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: "rgba(240,185,11,0.1)", color: "#f0b90b" }}
                        >
                          ${t}
                        </span>
                      ))}
                      <span className="text-[11px] text-[var(--text-muted)] ml-auto">
                        {timeAgo(item.published_at)}
                      </span>
                    </div>

                    <h3 className="text-[15px] font-bold leading-snug mb-2 group-hover:text-[#f0b90b] transition-colors line-clamp-2">
                      {headline}
                    </h3>

                    {body && canView && (
                      <p className="text-[13px] text-[var(--text-muted)] leading-relaxed line-clamp-2 mb-3">
                        {body}
                      </p>
                    )}
                    {body && !canView && (
                      <p className="text-[13px] text-[var(--text-muted)] leading-relaxed line-clamp-2 mb-3 select-none" style={{ filter: "blur(6px)" }}>
                        {body}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[var(--text-muted)]">{item.source}</span>
                      <span className="text-xs text-[#f0b90b] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        자세히 보기 →
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 text-[var(--text-muted)]">
              <p className="text-3xl mb-3">📭</p>
              <p className="text-sm font-medium mb-2">
                {selectedTicker ? `$${selectedTicker} 관련 뉴스가 없습니다` : "기업 뉴스가 없습니다"}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {selectedNews && (
        <NewsDetailModal news={selectedNews} onClose={() => setSelectedNews(null)} />
      )}

      {showVipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowVipModal(false)}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 max-w-sm mx-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-bold mb-2">VIP 전용 콘텐츠입니다</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">기업 뉴스 상세는 구독자만 열람할 수 있습니다.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowVipModal(false)} className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] border border-[var(--border)]">닫기</button>
              <a href="/#subscribe" className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black hover:opacity-90">구독하기</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
