"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import CardViewer from "@/components/CardViewer";
import CardNewsArticle from "@/components/CardNewsArticle";
import type { SampleJSON } from "@/components/CardNewsArticle";
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
  sampleJson?: SampleJSON; // 롱폼 기사용 데이터
}

/*
  ── Supabase card_news 테이블 (미생성, 나중에 마이그레이션) ──
  CREATE TABLE IF NOT EXISTS card_news (
    id serial PRIMARY KEY,
    date text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    slide_count integer NOT NULL,
    sample_json jsonb NOT NULL,
    created_at timestamptz DEFAULT now()
  );
  ALTER TABLE card_news ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public read card_news" ON card_news FOR SELECT USING (true);
*/

// ── 하드코딩 sample.json 데이터 (2026-03-20 장전) ──
const PREMARKET_2026_03_20: SampleJSON = {
  "_schema_version": "1.0",
  "meta": {
    "date": "2026.03.20",
    "day": "FRI",
    "handle": "@US_sokbo",
    "total_slides": 6
  },
  "cover": {
    "headline": "큰손들의 베팅 방향은?\n장전 어닝 3종목 실적 발표",
    "tickers": []
  },
  "indicators": [
    { "num": "01", "label": "나스닥100 투기포지션", "time": "KST 05:30", "values": "" },
    { "num": "02", "label": "S&P500 투기포지션", "time": "KST 05:30", "values": "" },
    { "num": "03", "label": "원유 투기포지션", "time": "KST 05:30", "values": "" },
    { "num": "04", "label": "금 투기포지션", "time": "KST 05:30", "values": "" }
  ],
  "earnings_pre": {
    "subtitle": "BEFORE 22:00 KST",
    "items": [
      {
        "symbol": "$CREX",
        "name": "크리에이티브 미디어 앤 커뮤니티",
        "quarter": "",
        "color": "purple",
        "status": "pending",
        "eps": "EPS 추정 $-0.03 │ 매출 $0.0B",
        "why": "소형 미디어·커뮤니티 플랫폼, 적자 지속 여부가 관건"
      },
      {
        "symbol": "$CHA",
        "name": "차이나 텔레콤 (ADR)",
        "quarter": "",
        "color": "purple",
        "status": "pending",
        "eps": "EPS 추정 $0.22 │ 매출 $0.5B",
        "why": "중국 국영 통신사, 중국 내수 경기와 연동된 대형주"
      },
      {
        "symbol": "$MAIA",
        "name": "마이아 바이오테크놀로지",
        "quarter": "",
        "color": "purple",
        "status": "pending",
        "eps": "EPS 추정 $-0.13",
        "why": "임상 단계 소형 바이오, 신약 개발 비용으로 적자 구조"
      }
    ]
  },
  "earnings_post": {
    "subtitle": "~05:00 KST",
    "items": []
  },
  "explainers": [
    {
      "badge": "주린이 설명서",
      "title": "<em-yellow>투기 포지션</em-yellow>이란\n무엇인가?",
      "qna": [
        {
          "q": "투기 포지션이 뭔가요?",
          "a": "헤지펀드 등 큰손들이 <strong>가격 상승·하락에 베팅</strong>한 계약 수예요. 많아질수록 한쪽 방향으로 쏠림이 커집니다."
        },
        {
          "q": "왜 매주 발표되나요?",
          "a": "미국 CFTC가 매주 금요일 집계해 발표해요. <yellow>큰손들의 심리</yellow>를 엿볼 수 있는 선행 지표로 활용됩니다."
        },
        {
          "q": "쏠림이 심하면 어떻게 되나요?",
          "a": "<red>한 방향으로 너무 몰리면</red> 반대 방향으로 급격히 튈 위험이 높아져요. 과열·과냉 신호로 봅니다."
        }
      ]
    },
    {
      "badge": "주린이 설명서",
      "title": "<em-yellow>장전 어닝</em-yellow>이\n주가에 미치는 영향",
      "qna": [
        {
          "q": "장전 어닝이 뭔가요?",
          "a": "시장 개장 <strong>전</strong>에 발표하는 실적이에요. 개장 직후 주가가 크게 움직이는 경우가 많습니다."
        },
        {
          "q": "EPS 추정치는 왜 중요?",
          "a": "<yellow>예상보다 좋으면 상승</yellow>, <red>나쁘면 하락</red> 압력이 생겨요. 시장 기대치와의 차이가 핵심입니다."
        }
      ],
      "flow": [
        { "title": "실적 발표", "detail": "장 시작 전", "color": "yellow" },
        { "title": "EPS 비교", "detail": "추정 vs 실제", "color": "purple" },
        { "title": "갭 형성", "detail": "시초가 급등락", "color": "red" },
        { "title": "거래량 폭발", "detail": "변동성 확대", "color": "pink" },
        { "title": "방향 결정", "detail": "추세 형성", "color": "green" }
      ],
      "impact": {
        "bullish": ["어닝 서프라이즈 종목", "동종 섹터주"],
        "bearish": ["어닝 쇼크 종목", "경쟁사 주가"]
      }
    }
  ],
  "checkpoints": [
    { "num": "01", "title": "투기 포지션 집계일", "desc": "CFTC 데이터는 매주 발표, <yellow>큰손 심리</yellow> 파악 가능" },
    { "num": "02", "title": "CREX 적자 지속 여부", "desc": "EPS 추정 <red>-$0.03</red>, 소형주 적자 흐름 주목" },
    { "num": "03", "title": "CHA 실적 확인", "desc": "EPS 추정 <green>$0.22</green>·매출 $0.5B, 흑자 유지 여부 확인" },
    { "num": "04", "title": "MAIA 적자 규모", "desc": "EPS 추정 <red>-$0.13</red>, 바이오 소형주 현금 소진 속도 점검" }
  ]
};

const SAMPLE_CARDS: Record<string, CardItem[]> = {
  premarket: [
    {
      date: "2026-03-20",
      title: "큰손들의 베팅 방향은? 장전 어닝 3종목",
      slides: 6,
      baseUrl: `${STORAGE_BASE}/2026-03-20-premarket`,
      sampleJson: PREMARKET_2026_03_20,
    },
  ],
  morning: [
    {
      date: "2026-03-20",
      title: "나스닥 +1.12% 반등, 이란 긴장 완화·릴리 신약 호재",
      slides: 9,
      baseUrl: `${STORAGE_BASE}/2026-03-20-morning`,
      // sampleJson 없음 — 모닝 sample.json 파일 미존재, 슬라이드 뷰어로 폴백
    },
  ],
  weekend: [],
};

type ViewMode =
  | { type: "list" }
  | { type: "slides"; card: CardItem }
  | { type: "article"; card: CardItem; data: SampleJSON };

export default function CardNewsPage() {
  const [activeTab, setActiveTab] = useState("premarket");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>({ type: "list" });
  const [showVipModal, setShowVipModal] = useState(false);
  const { isSubscriber, isAdmin } = useAuth();
  const canView = isSubscriber || isAdmin;
  const weekDates = getWeekDates();

  const cards = SAMPLE_CARDS[activeTab] || [];
  const filtered = selectedDay ? cards.filter((c) => c.date === selectedDay) : cards;

  const handleCardClick = (card: CardItem) => {
    if (!canView) {
      setShowVipModal(true);
      return;
    }
    // 롱폼 기사 데이터가 있으면 기사 뷰, 없으면 슬라이드 뷰어
    if (card.sampleJson) {
      setViewMode({ type: "article", card, data: card.sampleJson });
    } else {
      setViewMode({ type: "slides", card });
    }
  };

  // 기사 뷰 모드
  if (viewMode.type === "article") {
    return (
      <div className="min-h-screen">
        <CardNewsArticle
          data={viewMode.data}
          type={activeTab as "premarket" | "morning" | "weekend"}
          onBack={() => setViewMode({ type: "list" })}
        />
        <Footer />
      </div>
    );
  }

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
                onClick={() => handleCardClick(card)}
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
                      {card.sampleJson ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                          </svg>
                          기사 읽기
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="3" />
                            <path d="M7 12h10M12 7l5 5-5 5" />
                          </svg>
                          슬라이드 보기
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full text-center py-16 text-[var(--text-muted)]">
              <p className="text-lg mb-2">{"📭"}</p>
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

      {/* CardViewer 모달 (슬라이드 뷰) */}
      {viewMode.type === "slides" && (
        <CardViewer
          title={viewMode.card.title}
          slideCount={viewMode.card.slides}
          baseUrl={viewMode.card.baseUrl}
          onClose={() => setViewMode({ type: "list" })}
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
            <div className="text-4xl mb-4">{"🔒"}</div>
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
