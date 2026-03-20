"use client";

import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import CardNewsArticle from "@/components/CardNewsArticle";
import type { SampleJSON } from "@/components/CardNewsArticle";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

const TABS = [
  { id: "premarket", label: "장전 브리핑", emoji: "🌙", desc: "매일 22:00 · 오늘 밤 미국장 체크포인트" },
  { id: "morning", label: "모닝 브리핑", emoji: "☀️", desc: "매일 08:30 · 어젯밤 시장 결과 해석" },
  { id: "weekend", label: "주말 특별판", emoji: "📚", desc: "매주 토요일 · 주간 핵심 주제 깊이 분석" },
];

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

function getWeekDates() {
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

interface CardItem {
  date: string;
  title: string;
  type: string;
  slide_count: number;
  sample_json: SampleJSON;
}

type ViewMode =
  | { type: "list" }
  | { type: "article"; data: SampleJSON };

export default function CardNewsPage() {
  const [activeTab, setActiveTab] = useState("premarket");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>({ type: "list" });
  const [showVipModal, setShowVipModal] = useState(false);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSubscriber, isAdmin } = useAuth();
  const canView = isSubscriber || isAdmin;
  const weekDates = getWeekDates();

  // Supabase에서 카드뉴스 로드
  useEffect(() => {
    async function fetchCards() {
      setLoading(true);
      const { data, error } = await supabase
        .from("card_news")
        .select("*")
        .eq("type", activeTab)
        .order("date", { ascending: false })
        .limit(20);

      if (!error && data) {
        setCards(data as CardItem[]);
      }
      setLoading(false);
    }
    fetchCards();
  }, [activeTab]);

  const filtered = selectedDay ? cards.filter((c) => c.date === selectedDay) : cards;

  // 기사 뷰 모드
  if (viewMode.type === "article") {
    return (
      <div className="min-h-screen">
        <CardNewsArticle
          data={viewMode.data}
          onClose={() => setViewMode({ type: "list" })}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
          카드<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">뉴스</span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">매일 발행되는 브리핑 카드뉴스를 확인하세요</p>

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
                <span className={`text-sm font-bold ${activeTab === tab.id ? "text-[#f0b90b]" : "text-[var(--text)]"}`}>{tab.label}</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">{tab.desc}</p>
            </button>
          ))}
        </div>

        {/* 요일 선택 */}
        {activeTab !== "weekend" && (
          <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedDay(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !selectedDay ? "bg-[#f0b90b]/20 text-[#f0b90b] border border-[#f0b90b]/30" : "bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)]"
              }`}
            >전체</button>
            {weekDates.map((day) => (
              <button
                key={day.date}
                onClick={() => setSelectedDay(day.date)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDay === day.date
                    ? "bg-[#f0b90b]/20 text-[#f0b90b] border border-[#f0b90b]/30"
                    : day.isToday ? "bg-[var(--card)] text-white border border-[var(--text-muted)]/30" : "bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)]"
                }`}
              >
                {day.label}{day.isToday && <span className="ml-1 text-[#f0b90b]">·</span>}
              </button>
            ))}
          </div>
        )}

        {/* 카드 목록 */}
        {loading ? (
          <div className="text-center py-16 text-[var(--text-muted)]">불러오는 중...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {filtered.length > 0 ? filtered.map((card, i) => (
              <button
                key={`${card.date}-${card.type}-${i}`}
                onClick={() => {
                  if (!canView) { setShowVipModal(true); return; }
                  setViewMode({ type: "article", data: card.sample_json });
                }}
                className="group block bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[#f0b90b]/30 transition-all hover:scale-[1.01] text-left w-full"
              >
                <div className={`h-1 ${
                  activeTab === "premarket" ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1]" :
                  activeTab === "morning" ? "bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]" :
                  "bg-gradient-to-r from-[#22c55e] to-[#14b8a6]"
                }`} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[var(--text-muted)]">{card.date}</span>
                    <span className="text-xs text-[var(--text-muted)]">{card.slide_count}장</span>
                  </div>
                  <h3 className="text-base font-bold mb-3 group-hover:text-[#f0b90b] transition-colors line-clamp-2 whitespace-pre-line">
                    {card.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === "premarket" ? "bg-[#8b5cf6]/10 text-[#8b5cf6]" :
                      activeTab === "morning" ? "bg-[#f0b90b]/10 text-[#f0b90b]" :
                      "bg-[#22c55e]/10 text-[#22c55e]"
                    }`}>
                      {TABS.find((t) => t.id === activeTab)?.emoji} {TABS.find((t) => t.id === activeTab)?.label}
                    </span>
                    <span className="text-xs text-[#f0b90b] group-hover:translate-x-1 transition-transform">기사 읽기 →</span>
                  </div>
                </div>
              </button>
            )) : (
              <div className="col-span-full text-center py-16 text-[var(--text-muted)]">
                <p className="text-lg mb-2">📭</p>
                <p className="text-sm">해당 카드뉴스가 없습니다</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />

      {/* VIP 모달 */}
      {showVipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowVipModal(false)}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 max-w-sm mx-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-bold mb-2">VIP 전용 콘텐츠입니다</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">카드뉴스는 구독자만 열람할 수 있습니다.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowVipModal(false)} className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] border border-[var(--border)]">닫기</button>
              <a href="/#subscribe" className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black">구독하기</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
