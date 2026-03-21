"use client";

import { useState, useEffect, useCallback } from "react";
import Footer from "@/components/Footer";
import CardViewer from "@/components/CardViewer";
import CardArticle from "@/components/CardArticle";
import CardActions from "@/components/CardActions";
import { useAuth } from "@/components/AuthProvider";
import { supabase, type CardNews } from "@/lib/supabase";

const TABS = [
  { id: "premarket" as const, label: "장전 브리핑", emoji: "🌙", desc: "매일 22:00 · 오늘 밤 미국장 체크포인트" },
  { id: "morning" as const, label: "모닝 브리핑", emoji: "☀️", desc: "매일 08:30 · 어젯밤 시장 결과 해석" },
  { id: "weekend" as const, label: "주말 특별판", emoji: "📚", desc: "매주 토요일 · 주간 핵심 주제 깊이 분석" },
];

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const POLL_INTERVAL = 30_000;

function getWeekDates(): { label: string; date: string; isToday: boolean }[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));

  return DAYS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const date = d.toISOString().split("T")[0];
    const isToday = date === now.toISOString().split("T")[0];
    return { label: `${label} ${d.getDate()}일`, date, isToday };
  });
}

const TAB_COLORS: Record<string, { bar: string; badge: string }> = {
  premarket: { bar: "from-[#8b5cf6] to-[#6366f1]", badge: "bg-[#8b5cf6]/10 text-[#8b5cf6]" },
  morning:   { bar: "from-[#f0b90b] to-[#ef6d09]", badge: "bg-[#f0b90b]/10 text-[#f0b90b]" },
  weekend:   { bar: "from-[#22c55e] to-[#14b8a6]", badge: "bg-[#22c55e]/10 text-[#22c55e]" },
};

export default function CardNewsPage() {
  const [activeTab, setActiveTab] = useState<CardNews["type"]>("premarket");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [cards, setCards] = useState<CardNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllDates, setShowAllDates] = useState(false);
  const [viewerCard, setViewerCard] = useState<CardNews | null>(null);
  const [articleCard, setArticleCard] = useState<CardNews | null>(null);
  const [showVipModal, setShowVipModal] = useState(false);
  const { isSubscriber, useFreeView, freeViews, user, isAdmin } = useAuth();
  const weekDates = getWeekDates();

  const fetchCards = useCallback(async (type: CardNews["type"]) => {
    const { data } = await supabase
      .from("card_news")
      .select("id,type,date,title,slide_count,base_url,created_at,cover_image")
      .eq("type", type)
      .order("date", { ascending: false });

    if (data) setCards(data as CardNews[]);
    setLoading(false);
  }, []);

  const openCard = useCallback(async (card: CardNews) => {
    // 관리자/구독자는 바로 열림
    if (isAdmin || isSubscriber) {
      const { data } = await supabase.from("card_news").select("*").eq("id", card.id).single();
      if (data?.sample_json) setArticleCard(data as CardNews);
      else setViewerCard(card);
      return;
    }

    // 비구독자: 무료 크레딧 1건 차감
    if (freeViews <= 0) {
      setShowVipModal(true);
      return;
    }

    const ok = await useFreeView();
    if (!ok) { setShowVipModal(true); return; }

    const { data } = await supabase.from("card_news").select("*").eq("id", card.id).single();
    if (data?.sample_json) setArticleCard(data as CardNews);
    else setViewerCard(card);
  }, [isAdmin, isSubscriber, freeViews, useFreeView]);

  useEffect(() => {
    setLoading(true);
    setCards([]);
    fetchCards(activeTab);

    const interval = setInterval(() => fetchCards(activeTab), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [activeTab, fetchCards]);

  const datesWithCards = new Set(cards.map((c) => c.date));
  const filtered = selectedDay ? cards.filter((c) => c.date === selectedDay) : cards;

  const handleDelete = async (card: CardNews, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 카드뉴스를 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("card_news").delete().eq("id", card.id);
    if (!error) {
      setCards((prev) => prev.filter((c) => c.id !== card.id));
    }
  };

  const colors = TAB_COLORS[activeTab];
  const activeTabInfo = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
          카드
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
            뉴스
          </span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          매일 발행되는 브리핑 카드뉴스를 확인하세요
        </p>

        {/* Tab 선택 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedDay(null); }}
              className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all text-left ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#f0b90b]/10 to-[#ef6d09]/10 border-[#f0b90b]/30"
                  : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--text-muted)]/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{tab.emoji}</span>
                <span className={`text-sm font-bold ${activeTab === tab.id ? "text-[#f0b90b]" : "text-[var(--text)]"}`}>
                  {tab.label}
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">{tab.desc}</p>
            </button>
          ))}
        </div>

        {/* 날짜 선택 */}
        {activeTab !== "weekend" ? (
          <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 no-scrollbar items-center">
            {/* 오늘 버튼 (항상 표시) */}
            {weekDates.filter((d) => d.isToday).map((day) => (
              <button
                key={day.date}
                onClick={() => { setSelectedDay(selectedDay === day.date ? null : day.date); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  !selectedDay || selectedDay === day.date
                    ? "bg-[#f0b90b]/20 text-[#f0b90b] border border-[#f0b90b]/30"
                    : "bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)]"
                }`}
              >
                오늘 ({day.label})
              </button>
            ))}

            {/* 이전 날짜 토글 */}
            <button
              onClick={() => setShowAllDates(!showAllDates)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)] hover:text-white transition-all"
            >
              {showAllDates ? "접기" : "이전 날짜 ▾"}
            </button>

            {/* 나머지 날짜 (펼침 시) */}
            {showAllDates && weekDates.filter((d) => !d.isToday).map((day) => (
              <button
                key={day.date}
                onClick={() => setSelectedDay(day.date)}
                className={`relative flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDay === day.date
                    ? "bg-[#f0b90b]/20 text-[#f0b90b] border border-[#f0b90b]/30"
                    : "bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)] hover:text-white"
                }`}
              >
                {day.label}
                {datesWithCards.has(day.date) && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#f0b90b]" />
                )}
              </button>
            ))}
          </div>
        ) : (
          /* 주말 특별판: 주차 단위 */
          <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedDay(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !selectedDay
                  ? "bg-[#f0b90b]/20 text-[#f0b90b] border border-[#f0b90b]/30"
                  : "bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)] hover:text-white"
              }`}
            >
              전체
            </button>
          </div>
        )}

        {/* 카드 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {loading ? (
            <>
              {[0, 1].map((i) => (
                <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden animate-pulse">
                  <div className={`h-1 bg-gradient-to-r ${colors.bar} opacity-30`} />
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
          ) : filtered.length > 0 ? (
            filtered.map((card) => (
              <button
                key={card.id}
                onClick={() => openCard(card)}
                className="group block bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[#f0b90b]/40 transition-all hover:scale-[1.02] text-left w-full"
              >
                <div className={`h-1 bg-gradient-to-r ${colors.bar}`} />

                {/* 썸네일 프리뷰 */}
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
                    <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                      {activeTabInfo.emoji} {activeTabInfo.label}
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
              <p className="text-3xl mb-3">📭</p>
              <p className="text-sm font-medium mb-2">해당 날짜의 카드뉴스가 없습니다</p>
              <p className="text-xs text-[var(--text-muted)]/60">
                {activeTab === "premarket" && "장전 브리핑은 매일 22:00에 발행됩니다"}
                {activeTab === "morning" && "모닝 브리핑은 매일 08:30에 발행됩니다"}
                {activeTab === "weekend" && "주말 특별판은 매주 토요일에 발행됩니다"}
              </p>
            </div>
          )}
        </div>

        {/* 안내 */}
        <div className="text-center text-xs text-[var(--text-muted)] mb-8">
          카드뉴스는 매일 자동 생성되어 업로드됩니다 ·{" "}
          <a href="https://www.instagram.com/us_sokbo/" target="_blank" rel="noopener noreferrer" className="text-[#f0b90b] hover:underline">
            @us_sokbo 팔로우
          </a>
        </div>
      </div>
      <Footer />

      {articleCard && (
        <CardArticle
          card={articleCard}
          onClose={() => setArticleCard(null)}
        />
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowVipModal(false)}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 max-w-sm mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
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
              <button
                onClick={() => setShowVipModal(false)}
                className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--card)]"
              >
                닫기
              </button>
              {!user ? (
                <button
                  onClick={() => { setShowVipModal(false); /* signInWithGoogle handled by Navbar */ }}
                  className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black hover:opacity-90"
                >
                  회원가입하기
                </button>
              ) : freeViews > 0 ? (
                <button
                  onClick={async () => {
                    const ok = await useFreeView();
                    if (ok) { setShowVipModal(false); }
                  }}
                  className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black hover:opacity-90"
                >
                  무료 열람 사용 ({freeViews}건 남음)
                </button>
              ) : (
                <a
                  href="/#subscribe"
                  className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black hover:opacity-90"
                >
                  구독하기
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
