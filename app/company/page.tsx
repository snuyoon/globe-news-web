"use client";

import { useState, useEffect, useCallback } from "react";
import Footer from "@/components/Footer";
import CardViewer from "@/components/CardViewer";
import CardArticle from "@/components/CardArticle";
import CardActions from "@/components/CardActions";
import { useAuth } from "@/components/AuthProvider";
import { supabase, type CardNews } from "@/lib/supabase";

export default function CompanyPage() {
  const [cards, setCards] = useState<CardNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerCard, setViewerCard] = useState<CardNews | null>(null);
  const [articleCard, setArticleCard] = useState<CardNews | null>(null);
  const [showVipModal, setShowVipModal] = useState(false);
  const { isSubscriber, useFreeView, freeViews, user, isAdmin } = useAuth();

  const fetchCards = useCallback(async () => {
    const { data } = await supabase
      .from("card_news")
      .select("id,type,date,title,slide_count,base_url,created_at,cover_image")
      .eq("type", "company")
      .order("date", { ascending: false });

    if (data) setCards(data as CardNews[]);
    setLoading(false);
  }, []);

  const openCard = useCallback(async (card: CardNews) => {
    if (isAdmin || isSubscriber) {
      const { data } = await supabase.from("card_news").select("*").eq("id", card.id).single();
      if (data?.sample_json) setArticleCard(data as CardNews);
      else setViewerCard(card);
      return;
    }

    if (freeViews <= 0) { setShowVipModal(true); return; }

    const ok = await useFreeView();
    if (!ok) { setShowVipModal(true); return; }

    const { data } = await supabase.from("card_news").select("*").eq("id", card.id).single();
    if (data?.sample_json) setArticleCard(data as CardNews);
    else setViewerCard(card);
  }, [isAdmin, isSubscriber, freeViews, useFreeView]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleDelete = async (card: CardNews, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 카드뉴스를 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("card_news").delete().eq("id", card.id);
    if (!error) {
      setCards((prev) => prev.filter((c) => c.id !== card.id));
    }
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
          매주 일요일 · 핫한 기업을 깊이 분석합니다
        </p>

        {/* 카드 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {loading ? (
            <>
              {[0, 1].map((i) => (
                <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden animate-pulse">
                  <div className="h-1 bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] opacity-30" />
                  <div className="aspect-[16/9] bg-[var(--border)]/30" />
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <div className="h-3 w-20 bg-[var(--border)] rounded" />
                      <div className="h-3 w-10 bg-[var(--border)] rounded" />
                    </div>
                    <div className="h-4 w-3/4 bg-[var(--border)] rounded" />
                    <div className="h-3 w-1/2 bg-[var(--border)] rounded" />
                  </div>
                </div>
              ))}
            </>
          ) : cards.length > 0 ? (
            cards.map((card) => (
              <button
                key={card.id}
                onClick={() => openCard(card)}
                className="group block bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[#f0b90b]/40 transition-all hover:scale-[1.02] text-left w-full"
              >
                <div className="h-1 bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]" />

                <div className="relative aspect-[16/9] bg-black/20 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.cover_image || `${card.base_url}/slide_1.png`}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                    {card.slide_count}장
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[var(--text-muted)]">{card.date}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#f0b90b]/10 text-[#f0b90b]">
                      기업분석
                    </span>
                  </div>
                  <h3 className="text-sm font-bold mb-3 group-hover:text-[#f0b90b] transition-colors line-clamp-2">
                    {card.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#f0b90b] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="3" />
                        <path d="M7 12h10M12 7l5 5-5 5" />
                      </svg>
                      슬라이드 보기
                    </span>
                    {isAdmin && (
                      <span
                        onClick={(e) => handleDelete(card, e)}
                        className="text-xs text-[#ef4444] hover:text-[#dc2626] transition-colors cursor-pointer"
                      >
                        삭제
                      </span>
                    )}
                  </div>
                  <CardActions cardId={card.id} />
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full text-center py-16 text-[var(--text-muted)]">
              <p className="text-3xl mb-3">📊</p>
              <p className="text-sm font-medium mb-2">아직 기업분석이 없습니다</p>
              <p className="text-xs text-[var(--text-muted)]/60">
                기업분석은 매주 일요일에 발행됩니다
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {articleCard && (
        <CardArticle card={articleCard} onClose={() => setArticleCard(null)} />
      )}

      {viewerCard && (
        <CardViewer
          title={viewerCard.title}
          slideCount={viewerCard.slide_count}
          baseUrl={viewerCard.base_url}
          onClose={() => setViewerCard(null)}
        />
      )}

      {showVipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowVipModal(false)}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 max-w-sm mx-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-bold mb-2">VIP 전용 콘텐츠입니다</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              {!user ? (
                <>회원가입만 하면 <strong className="text-[#f0b90b]">2건 무료 체험</strong>할 수 있어요!</>
              ) : freeViews > 0 ? (
                <>무료 열람권 <strong className="text-[#f0b90b]">{freeViews}건</strong> 남았어요. 사용하시겠어요?</>
              ) : (
                <>무료 체험을 모두 사용했습니다. 구독하고 모든 콘텐츠를 이용해보세요!</>
              )}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowVipModal(false)} className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] border border-[var(--border)]">닫기</button>
              {!user ? (
                <button onClick={() => setShowVipModal(false)} className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black hover:opacity-90">회원가입하기</button>
              ) : freeViews > 0 ? (
                <button onClick={async () => { const ok = await useFreeView(); if (ok) setShowVipModal(false); }} className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black hover:opacity-90">무료 열람 사용 ({freeViews}건 남음)</button>
              ) : (
                <a href="/#subscribe" className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black hover:opacity-90">구독하기</a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
