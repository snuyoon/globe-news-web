"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

export default function NewsScrapButton({ newsId }: { newsId: number }) {
  const { user } = useAuth();
  const [scraped, setScraped] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("news_scraps")
      .select("id")
      .eq("news_id", newsId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setScraped(!!data));
  }, [newsId, user]);

  const toggle = useCallback(async () => {
    if (!user) return;
    if (scraped) {
      await supabase.from("news_scraps").delete().eq("news_id", newsId).eq("user_id", user.id);
      setScraped(false);
    } else {
      await supabase.from("news_scraps").insert({ news_id: newsId, user_id: user.id });
      setScraped(true);
      setAnimate(true);
      setTimeout(() => setAnimate(false), 300);
    }
  }, [user, scraped, newsId]);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      disabled={!user}
      className={`flex items-center gap-1.5 text-sm transition-all ${
        scraped ? "text-[#f0b90b]" : "text-[var(--text-muted)] hover:text-[#f0b90b]"
      } ${animate ? "scale-125" : ""} disabled:opacity-40`}
      title={user ? (scraped ? "스크랩 취소" : "스크랩") : "로그인 필요"}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={scraped ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-xs">{scraped ? "스크랩됨" : "스크랩"}</span>
    </button>
  );
}
