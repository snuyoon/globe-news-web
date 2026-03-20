"use client";

import { useEffect, useState } from "react";
import { supabase, type News } from "@/lib/supabase";

export default function TodayBrief() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrief() {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .gte("importance", 4)
        .order("published_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setItems(data as News[]);
      }
      setLoading(false);
    }
    fetchBrief();
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#f0b90b] to-[#ef6d09]" />
        <h2 className="text-xl md:text-2xl font-bold">오늘의 브리핑</h2>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6">
        {loading ? (
          <div className="text-[var(--text-muted)] text-sm py-4">불러오는 중...</div>
        ) : items.length === 0 ? (
          <div className="text-[var(--text-muted)] text-sm py-4">
            아직 오늘의 주요 브리핑이 없습니다.
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item, idx) => (
              <li key={item.id} className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#f0b90b]/15 text-[#f0b90b] text-[12px] font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] md:text-[15px] font-medium leading-snug break-words">
                    {(item.korean_text ?? item.title).split("\n")[0]}
                  </p>
                  {item.tickers?.length > 0 && (
                    <div className="mt-1 flex gap-1.5 flex-wrap">
                      {item.tickers.slice(0, 3).map((t) => (
                        <span key={t} className="text-[11px] text-[#f0b90b] font-medium">
                          ${t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 pt-4 border-t border-[var(--border)]">
          <a
            href="https://www.instagram.com/us_sokbo/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#f0b90b] font-semibold hover:opacity-80 transition-opacity"
          >
            자세한 카드뉴스 보기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
