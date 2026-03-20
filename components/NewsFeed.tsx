"use client";

import { useEffect, useState, useCallback } from "react";
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

  const fetchNews = useCallback(async (append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
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

    if (append && news.length > 0) {
      const lastDate = news[news.length - 1].published_at;
      query = query.lt("published_at", lastDate);
    }

    const { data, error } = await query;
    if (!error && data) {
      const typed = data as News[];
      if (append) {
        setNews((prev) => [...prev, ...typed]);
      } else {
        setNews(typed);
      }
      setHasMore(typed.length >= PAGE_SIZE);
    }
    setLoading(false);
    setLoadingMore(false);
  }, [importanceFilter, themeFilter, news]);

  // Refetch when filters change
  useEffect(() => {
    fetchNews(false);
    const interval = setInterval(() => {
      // Only auto-refresh if not appending
      fetchNews(false);
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importanceFilter, themeFilter]);

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
      <div className="sticky top-0 z-20 bg-[var(--bg)]/95 backdrop-blur-sm pb-4 pt-2 border-b border-[var(--border)] mb-6">
        {/* Importance filter */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[11px] text-[var(--text-muted)] font-medium mr-1 shrink-0">중요도</span>
          {IMPORTANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleImportance(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
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
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            LIVE
          </div>
        </div>

        {/* Theme filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-[var(--text-muted)] font-medium mr-1 shrink-0">테마</span>
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setThemeFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all shrink-0 ${
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
