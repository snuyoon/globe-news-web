"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, type News } from "@/lib/supabase";
import NewsCard from "./NewsCard";

const POLL_INTERVAL = 30_000; // 30초마다 새 뉴스 확인

type Filter = "all" | "breaking" | "digest";

export default function NewsFeed() {
  const [news, setNews] = useState<News[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    let query = supabase
      .from("news")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(50);

    if (filter === "breaking") {
      query = query.gte("importance", 4);
    } else if (filter === "digest") {
      query = query.eq("is_digest", true);
    }

    const { data, error } = await query;
    if (!error && data) {
      setNews(data as News[]);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const filterButtons: { key: Filter; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "breaking", label: "속보" },
    { key: "digest", label: "다이제스트" },
  ];

  return (
    <div>
      {/* 필터 탭 */}
      <div className="sticky top-0 z-10 bg-[var(--bg)]/95 backdrop-blur border-b border-[var(--border)] px-4 py-2 flex gap-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${
              filter === btn.key
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--card)]"
            }`}
          >
            {btn.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          실시간
        </div>
      </div>

      {/* 뉴스 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-[var(--text-muted)] text-sm">
            뉴스를 불러오는 중...
          </div>
        </div>
      ) : news.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-[var(--text-muted)]">아직 뉴스가 없습니다</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              파이프라인이 뉴스를 수집하면 여기에 표시됩니다
            </p>
          </div>
        </div>
      ) : (
        <div>
          {news.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      )}
    </div>
  );
}
