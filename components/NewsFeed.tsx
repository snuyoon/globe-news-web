"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, type News } from "@/lib/supabase";
import NewsCard from "./NewsCard";
import NewsDetailModal from "./NewsDetailModal";

const POLL_INTERVAL = 30_000;
const PAGE_SIZE = 100;

const IMPORTANCE_OPTIONS = [
  { value: 0, label: "전체" },
  { value: 5, label: "긴급", stars: 5 },
  { value: 4, label: "속보", stars: 4 },
  { value: 3, label: "주요", stars: 3 },
  { value: 2, label: "참고", stars: 2 },
  { value: 1, label: "일반", stars: 1 },
];

const THEME_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "실적", label: "실적" },
  { value: "경제지표", label: "경제지표" },
  { value: "연준", label: "연준" },
  { value: "지정학", label: "지정학" },
  { value: "정치", label: "정치" },
  { value: "원자재", label: "원자재" },
  { value: "암호화폐", label: "코인" },
  { value: "기타", label: "기타" },
];

function renderStars(count: number) {
  return "★".repeat(count);
}

export default function NewsFeed() {
  const [news, setNews] = useState<News[]>([]);
  const [importanceFilter, setImportanceFilter] = useState<Set<number>>(new Set());
  const [themeFilter, setThemeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const newsRef = useRef<News[]>([]);

  // newsRef를 news와 동기화
  useEffect(() => { newsRef.current = news; }, [news]);

  const fetchNews = useCallback(async (append = false) => {
    if (append) {
      setLoadingMore(true);
    } else if (newsRef.current.length === 0) {
      setLoading(true);
    }

    let query = supabase
      .from("news")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (importanceFilter.size > 0) {
      query = query.in("importance", Array.from(importanceFilter));
    }

    if (themeFilter !== "all") {
      query = query.eq("theme", themeFilter);
    }

    if (append) {
      const lastDate = newsRef.current[newsRef.current.length - 1]?.published_at;
      if (lastDate) query = query.lt("published_at", lastDate);
    }

    const { data, error } = await query;
    if (!error && data) {
      const typed = data as News[];
      if (append) {
        setNews((prev) => [...prev, ...typed]);
      } else {
        setNews(typed);
        setNewCount(0);
      }
      setHasMore(typed.length >= PAGE_SIZE);
    }
    setLoading(false);
    setLoadingMore(false);
  }, [importanceFilter, themeFilter]);

  // 새 뉴스 체크 (전체 교체 대신 최신 1건만 확인)
  const checkForNew = useCallback(async () => {
    if (newsRef.current.length === 0) return;
    const latestDate = newsRef.current[0].published_at;
    let query = supabase
      .from("news")
      .select("id", { count: "exact", head: true })
      .gt("published_at", latestDate);

    if (importanceFilter.size > 0) {
      query = query.in("importance", Array.from(importanceFilter));
    }
    if (themeFilter !== "all") {
      query = query.eq("theme", themeFilter);
    }

    const { count } = await query;
    if (count && count > 0) {
      setNewCount(count);
    }
  }, [importanceFilter, themeFilter]);

  // 초기 로드 + 필터 변경 시 fetch
  useEffect(() => {
    fetchNews(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importanceFilter, themeFilter]);

  // 자동 새로고침: 새 뉴스 있으면 배너만 표시, 자동 반영
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      checkForNew();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [autoRefresh, checkForNew]);

  // 새 뉴스가 감지되면 자동 병합
  useEffect(() => {
    if (newCount > 0 && autoRefresh) {
      fetchNews(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newCount]);

  const toggleImportance = (value: number) => {
    if (value === 0) {
      // "전체" clears all specific filters
      setImportanceFilter(new Set());
      return;
    }
    setImportanceFilter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const isImportanceActive = (value: number) => {
    if (value === 0) return importanceFilter.size === 0;
    return importanceFilter.has(value);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-8">
      {/* Filter bar */}
      <div className="sticky top-0 z-20 bg-[var(--bg)]/95 backdrop-blur-sm pb-2 md:pb-4 pt-2 border-b border-[var(--border)] mb-4 md:mb-6">
        {/* Mobile: compact toggle + LIVE */}
        <div className="flex items-center justify-between md:hidden mb-2">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--card)] text-[12px] font-semibold text-[var(--text-muted)]"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${filterOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            필터
            {(importanceFilter.size > 0 || themeFilter !== "all") && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#f0b90b]" />
            )}
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${autoRefresh ? "bg-green-500 live-dot" : "bg-gray-500"}`} />
            {autoRefresh ? "LIVE" : "일시정지"}
          </button>
        </div>

        {/* Desktop: always show / Mobile: collapsible */}
        <div className={`${filterOpen ? "block" : "hidden"} md:block`}>
          {/* Importance filter */}
          <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 flex-wrap">
            <span className="text-[11px] text-[var(--text-muted)] font-medium mr-1 shrink-0">중요도</span>
            {IMPORTANCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleImportance(opt.value)}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[11px] md:text-[12px] font-semibold transition-all ${
                  isImportanceActive(opt.value)
                    ? "bg-[var(--card-hover)] text-white ring-1 ring-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--card)]"
                }`}
              >
                {opt.stars ? (
                  <span>
                    <span className={`mr-1 ${
                      opt.value === 5 ? "text-red-500" :
                      opt.value === 4 ? "text-orange-400" :
                      opt.value === 3 ? "text-blue-400" :
                      opt.value === 2 ? "text-gray-400" :
                      "text-gray-600"
                    }`}>{renderStars(opt.stars)}</span>
                    {opt.label}
                  </span>
                ) : (
                  opt.label
                )}
              </button>
            ))}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="ml-auto hidden md:flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${autoRefresh ? "bg-green-500 live-dot" : "bg-gray-500"}`} />
              {autoRefresh ? "LIVE · 자동 업데이트" : "일시정지 · 눌러서 재개"}
            </button>
          </div>

          {/* Theme filter */}
          <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-[var(--text-muted)] font-medium mr-1 shrink-0">테마</span>
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setThemeFilter(opt.value)}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[11px] md:text-[12px] font-semibold whitespace-nowrap transition-all shrink-0 ${
                  themeFilter === opt.value
                    ? "bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black"
                    : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--card)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            뉴스 불러오는 중...
          </div>
        </div>
      ) : news.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-[var(--text-muted)]">조건에 맞는 뉴스가 없습니다</p>
            <p className="text-[var(--text-muted)] text-sm mt-1 opacity-60">
              필터를 변경하거나 잠시 후 다시 확인해주세요
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.map((item, i) => (
              <div key={item.id} onClick={() => setSelectedNews(item)} className="cursor-pointer">
                <NewsCard news={item} index={i} />
              </div>
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchNews(true)}
                disabled={loadingMore}
                className="px-6 py-2.5 rounded-lg bg-[var(--card)] hover:bg-[var(--card-hover)] text-sm font-medium text-[var(--text-muted)] hover:text-white transition-all border border-[var(--border)]"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    불러오는 중...
                  </span>
                ) : (
                  "더 보기"
                )}
              </button>
            </div>
          )}
        </>
      )}
      {/* 뉴스 상세 모달 */}
      {selectedNews && (
        <NewsDetailModal news={selectedNews} onClose={() => setSelectedNews(null)} />
      )}
    </div>
  );
}
