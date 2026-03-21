"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

interface CardActionsProps {
  cardId: number;
}

export default function CardActions({ cardId }: CardActionsProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [scraped, setScraped] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [animateLike, setAnimateLike] = useState(false);
  const [animateScrap, setAnimateScrap] = useState(false);

  // 초기 상태 로드
  useEffect(() => {
    // 좋아요 수
    supabase
      .from("card_likes")
      .select("id", { count: "exact", head: true })
      .eq("card_id", cardId)
      .then(({ count }) => setLikeCount(count ?? 0));

    // 내가 좋아요/스크랩 했는지
    if (user) {
      supabase
        .from("card_likes")
        .select("id")
        .eq("card_id", cardId)
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => setLiked(!!data));

      supabase
        .from("card_scraps")
        .select("id")
        .eq("card_id", cardId)
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => setScraped(!!data));
    }
  }, [cardId, user]);

  const toggleLike = useCallback(async () => {
    if (!user) return;
    if (liked) {
      await supabase.from("card_likes").delete().eq("card_id", cardId).eq("user_id", user.id);
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase.from("card_likes").insert({ card_id: cardId, user_id: user.id });
      setLiked(true);
      setLikeCount((c) => c + 1);
      setAnimateLike(true);
      setTimeout(() => setAnimateLike(false), 300);
    }
  }, [user, liked, cardId]);

  const toggleScrap = useCallback(async () => {
    if (!user) return;
    if (scraped) {
      await supabase.from("card_scraps").delete().eq("card_id", cardId).eq("user_id", user.id);
      setScraped(false);
    } else {
      await supabase.from("card_scraps").insert({ card_id: cardId, user_id: user.id });
      setScraped(true);
      setAnimateScrap(true);
      setTimeout(() => setAnimateScrap(false), 300);
    }
  }, [user, scraped, cardId]);

  return (
    <div className="flex items-center gap-4 pt-3">
      {/* 하트 */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleLike(); }}
        disabled={!user}
        className={`flex items-center gap-1.5 text-sm transition-all ${
          liked ? "text-[#ef4444]" : "text-[var(--text-muted)] hover:text-[#ef4444]"
        } ${animateLike ? "scale-125" : ""} disabled:opacity-40`}
        title={user ? (liked ? "좋아요 취소" : "좋아요") : "로그인 필요"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
      </button>

      {/* 스크랩 */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleScrap(); }}
        disabled={!user}
        className={`flex items-center gap-1.5 text-sm transition-all ${
          scraped ? "text-[#f0b90b]" : "text-[var(--text-muted)] hover:text-[#f0b90b]"
        } ${animateScrap ? "scale-125" : ""} disabled:opacity-40`}
        title={user ? (scraped ? "스크랩 취소" : "스크랩") : "로그인 필요"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={scraped ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xs">{scraped ? "스크랩됨" : "스크랩"}</span>
      </button>
    </div>
  );
}
