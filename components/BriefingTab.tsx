"use client";

import { useEffect, useState } from "react";
import { supabase, type News } from "@/lib/supabase";

interface BriefingTabProps {
  type: "morning" | "premarket";
  time: string;
}

export default function BriefingTab({ type, time }: BriefingTabProps) {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBriefings() {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_digest", true)
        .order("published_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setItems(data as News[]);
      }
      setLoading(false);
    }
    fetchBriefings();
  }, [type]);

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="live-dot w-2 h-2 rounded-full bg-[#f0b90b] inline-block" />
        <span className="text-[13px] text-[var(--text-muted)]">
          매일 {time}에 업데이트
        </span>
      </div>

      {loading ? (
        <div className="text-[var(--text-muted)] text-sm py-8 text-center">
          브리핑 불러오는 중...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--border)] mb-3">
            <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[14px] text-[var(--text-muted)]">
            {type === "morning"
              ? "모닝 브리핑은 08:30에 업데이트됩니다."
              : "장전 브리핑은 22:00에 업데이트됩니다."}
          </p>
          <p className="text-[12px] text-[var(--text-muted)] mt-1 opacity-60">
            최신 업데이트를 확인해 주세요
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:border-[#f0b90b]/30 transition-colors"
            >
              <p className="text-[14px] font-medium leading-snug">{item.title}</p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                {item.theme && (
                  <span className="px-1.5 py-0.5 rounded bg-[var(--border)] text-[10px]">
                    {item.theme}
                  </span>
                )}
                <span>
                  {new Date(item.published_at).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
