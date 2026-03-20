"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import CardViewer from "@/components/CardViewer";
import { useAuth } from "@/components/AuthProvider";

const TABS = [
  { id: "premarket", label: "장전 브리핑", emoji: "🌙", desc: "매일 22:00 · 오늘 밤 미국장 체크포인트" },
  { id: "morning", label: "모닝 브리핑", emoji: "☀️", desc: "매일 08:30 · 어젯밤 시장 결과 해석" },
  { id: "weekend", label: "주말 특별판", emoji: "📚", desc: "매주 토요일 · 주간 핵심 주제 깊이 분석" },
];

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

function getWeekDates(): { label: string; date: string; isToday: boolean }[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=일 1=월...
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

// Supabase Storage base URL
const STORAGE_BASE = "https://bjdlyjeltwjukuthxkti.supabase.co/storage/v1/object/public/card-images/archive";

// 카드뉴스 데이터 (하드코딩, 나중에 Supabase card_news 테이블 연동)
// baseUrl: Supabase Storage 경로. 이미지: {baseUrl}/slide_1.png ~ slide_N.png
interface CardItem {
  date: string;
  title: string;
  slides: number;
  baseUrl: string; // Supabase Storage archive 경로
}

const SAMPLE_CARDS: Record<string, CardItem[]> = {
  premarket: [
    {
      date: "2026-03-20",
      title: "큰손들의 베팅 방향은? 장전 어닝 3종목",
      slides: 6,
      baseUrl: `${STORAGE_BASE}/2026-03-20-premarket`,
    },
  ],
  morning: [
    {
      date: "2026-03-20",
      title: "나스닥 +1.12% 반등, 이란 긴장 완화·릴리 신약 호재",
      slides: 9,
      baseUrl: `${STORAGE_BASE}/2026-03-20-morning`,
    },
  ],
  weekend: [],
};

export default function CardNewsPage() {
  const [activeTab, setActiveTab] = useState("premarket");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [viewerCard, setViewerCard] = useState<CardItem | null>(null);
  const [showVipModal, setShowVipModal] = useState(false);
  const { isSubscriber, isAdmin } = useAuth();
  const canView = isSubscriber || isAdmin;
  const weekDates = getWeekDates();

  const cards = SAMPLE_CARDS[activeTab] || [];
  const filtered = selectedDay ? cards.filter((c) => c.date === selectedDay) : cards;

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

        {/* 요일 선택 (주말 특별판은 제외) */}
        {activeTab !== "weekend" && (
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
            {weekDates.map((day) => (
              <button
                key={day.date}
                onClick={() => setSelectedDay(day.date)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDay === day.date
                    ? "bg-[#f0b90b]/20 text-[#f0b90b] border border-[#f0b90b]/30"
                    : day.isToday
                      ? "bg-[var(--card)] text-white border border-[var(--text-muted)]/30"
                      : "bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)] hover:text-white"
                }`}
              >
                {day.label}
                {day.isToday && <span className="ml-1 text-[#f0b90b]">·</span>}
              </button>
            ))}
          </div>
        )}

        {/* 카드 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {filtered.length > 0 ? (
            filtered.map((card, i) => (
              <button
                key={`${card.date}-${i}`}
                onClick={() => canView ? setViewerCard(card) : setShowVipModal(true)}
                className="group block bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[#f0b90b]/30 transition-all hover:scale-[1.01] text-left w-full"
              >
                {/* 상단 컬러 바 */}
                <div className={`h-1 ${
                  activeTab === "premarket" ? "bg-gradient-to-r from-[#8b5cf6] to-[#6366f1]" :
                  activeTab === "morning" ? "bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]" :
                  "bg-gradient-to-r from-[#22c55e] to-[#14b8a6]"
                }`} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[var(--text-muted)]">{card.date}</span>
                    <span className="text-xs text-[var(--text-muted)]">{card.slides}장</span>
                  </div>
                  <h3 className="text-base font-bold mb-3 group-hover:text-[#f0b90b] transition-colors line-clamp-2">
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
                    <span className="text-xs text-[#f0b90b] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="3" />
                        <path d="M7 12h10M12 7l5 5-5 5" />
                      </svg>
                      슬라이드 보기
                    </span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full text-center py-16 text-[var(--text-muted)]">
              <p className="text-lg mb-2">📭</p>
              <p className="text-sm">해당 날짜의 카드뉴스가 없습니다</p>
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

      {/* CardViewer 모달 */}
      {viewerCard && (
        <CardViewer
          title={viewerCard.title}
          slideCount={viewerCard.slides}
          baseUrl={viewerCard.baseUrl}
          onClose={() => setViewerCard(null)}
        />
      )}

      {/* VIP 전용 모달 */}
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
              카드뉴스는 구독자만 열람할 수 있습니다.<br />
              구독하고 모든 콘텐츠를 이용해보세요!
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowVipModal(false)}
                className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--card)]"
              >
                닫기
              </button>
              <a
                href="/#subscribe"
                className="px-6 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black hover:opacity-90"
              >
                구독하기
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
