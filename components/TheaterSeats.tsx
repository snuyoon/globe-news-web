"use client";

import { useEffect, useState, useCallback } from "react";
import Character, { type EyeStyle, type HairStyle } from "./Character";
import CharacterModal, { type SeatData } from "./CharacterModal";
import SubscribeModal from "./SubscribeModal";

const ROWS = "ABCDEFGHIJ".split("");
const COLS = Array.from({ length: 10 }, (_, i) => i + 1);
const STORAGE_KEY = "theater_seats";

// 럭키넘버: 좌석 순번 (A1=1, A2=2, ... J10=100)
const LUCKY_NUMBERS = new Set([1, 7, 77, 100]);
function getSeatNumber(row: string, col: number): number {
  return ROWS.indexOf(row) * 10 + col;
}
function isLuckySeat(row: string, col: number): boolean {
  return LUCKY_NUMBERS.has(getSeatNumber(row, col));
}

const SEAT_COLORS = ["#e74c3c", "#3498db", "#f1c40f", "#9b59b6", "#e91e8a", "#27ae60", "#ef6d09", "#1abc9c"];
const DEMO_EYES: EyeStyle[] = ["dot", "round", "happy", "star"];
const DEMO_HAIR: HairStyle[] = ["bangs", "parted", "none", "curly"];
const DEMO_INITIALS = [
  "JH", "MK", "SY", "YJ", "HS", "JW", "EJ", "DH", "SM", "HJ",
  "JY", "SW", "MJ", "KH", "YS", "TH", "BK", "SH", "WJ", "GD",
  "JK", "HN", "YR", "DJ", "CW",
];

// 좌석 순서: A1=1, A2=2, ... A10=10, B1=11, ... J10=100
function seatIdByOrder(n: number): string {
  const row = ROWS[Math.floor((n - 1) / 10)];
  const col = ((n - 1) % 10) + 1;
  return `${row}${col}`;
}

function generateDemoSeats(): Record<string, SeatData> {
  // 0명 — 실제 구독자만 착석
  return {};
}

export default function TheaterSeats() {
  const [seats, setSeats] = useState<Record<string, SeatData>>({});
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [subscribeSeat, setSubscribeSeat] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [mySeatedId, setMySeatedId] = useState<string | null>(null); // 이미 앉은 좌석
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sub = localStorage.getItem("us_sokbo_subscription");
    setIsSubscribed(!!sub);
    if (sub) {
      try { setMySeatedId(JSON.parse(sub).seatId || null); } catch { /* */ }
    }
    // #subscribe 앵커로 왔으면 자동으로 구독 모달
    if (window.location.hash === "#subscribe" && !sub) {
      setTimeout(() => {
        for (let n = 1; n <= 100; n++) {
          const id = seatIdByOrder(n);
          const stored = localStorage.getItem(STORAGE_KEY);
          const seats = stored ? JSON.parse(stored) : {};
          if (!seats[id]) { setSubscribeSeat(id); break; }
        }
      }, 500);
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    const version = localStorage.getItem(STORAGE_KEY + "_v");
    // v3: 순서대로 채우기
    if (stored && version === "5") {
      try { setSeats(JSON.parse(stored)); }
      catch { const d = generateDemoSeats(); setSeats(d); localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
    } else {
      const d = generateDemoSeats(); setSeats(d);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
      localStorage.setItem(STORAGE_KEY + "_v", "5");
      localStorage.removeItem("us_sokbo_subscription");
    }
  }, []);

  const handleSave = useCallback((seatId: string, data: SeatData) => {
    setSeats((prev) => {
      const next = { ...prev, [seatId]: data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setMySeatedId(seatId);
    // 구독 정보에 seatId 기록
    const sub = localStorage.getItem("us_sokbo_subscription");
    if (sub) {
      try {
        const parsed = JSON.parse(sub);
        parsed.seatId = seatId;
        localStorage.setItem("us_sokbo_subscription", JSON.stringify(parsed));
      } catch { /* */ }
    }
    setSelectedSeat(null);
  }, []);

  const occupiedCount = Object.keys(seats).length;
  const remaining = 100 - occupiedCount;
  const fillPercent = occupiedCount;

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-[var(--text-muted)] animate-pulse">불러오는 중...</div></div>;
  }

  return (
    <>
      <section className="min-h-screen relative overflow-hidden">
        {/* Background: space + candlestick */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#0d0d20]" />
        {/* Stars */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(1px 1px at 20px 30px, white, transparent), radial-gradient(1px 1px at 80px 60px, white, transparent), radial-gradient(1px 1px at 140px 20px, white, transparent), radial-gradient(1px 1px at 200px 80px, white, transparent), radial-gradient(1px 1px at 300px 40px, white, transparent), radial-gradient(1px 1px at 400px 70px, white, transparent), radial-gradient(1px 1px at 500px 30px, white, transparent), radial-gradient(1px 1px at 600px 90px, white, transparent)",
          backgroundSize: "700px 100px",
        }} />
        {/* Candlestick chart silhouette */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.06] pointer-events-none">
          <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="none">
            <g stroke="#22c55e" strokeWidth="2" fill="none">
              <line x1="50" y1="100" x2="50" y2="300" /><rect x="42" y="150" width="16" height="80" fill="#22c55e" opacity="0.5" />
              <line x1="100" y1="120" x2="100" y2="280" /><rect x="92" y="140" width="16" height="100" fill="#ef4444" opacity="0.5" />
              <line x1="150" y1="80" x2="150" y2="260" /><rect x="142" y="100" width="16" height="120" fill="#22c55e" opacity="0.5" />
              <line x1="200" y1="140" x2="200" y2="320" /><rect x="192" y="160" width="16" height="90" fill="#22c55e" opacity="0.5" />
              <line x1="250" y1="100" x2="250" y2="290" /><rect x="242" y="130" width="16" height="110" fill="#ef4444" opacity="0.5" />
              <line x1="300" y1="60" x2="300" y2="240" /><rect x="292" y="80" width="16" height="100" fill="#22c55e" opacity="0.5" />
              <line x1="350" y1="90" x2="350" y2="270" /><rect x="342" y="110" width="16" height="100" fill="#22c55e" opacity="0.5" />
              <line x1="400" y1="130" x2="400" y2="310" /><rect x="392" y="150" width="16" height="80" fill="#ef4444" opacity="0.5" />
            </g>
          </svg>
        </div>
        {/* Glow */}
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#f0b90b]/[0.03] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0a1a] to-transparent pointer-events-none" />

        {/* Main content: split layout */}
        <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 py-12 gap-8 lg:gap-12 max-w-7xl mx-auto">

          {/* Left: Info panel */}
          <div className="flex-shrink-0 lg:w-[380px] text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4">
              AI가 선별한<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
                미국 금융 속보
              </span>
            </h1>
            <p className="text-[var(--text-muted)] text-sm md:text-base mb-6">
              실시간 속보 · 모닝 브리핑 · 장전 브리핑 · 카드뉴스
            </p>

            {/* Price */}
            <div className="mb-6 flex flex-col gap-1 items-center lg:items-start">
              <div className="flex items-center gap-3">
                <span className="text-2xl md:text-3xl text-[var(--text-muted)]/50 line-through decoration-[var(--text-muted)]/30 decoration-2">9,900원</span>
                <span className="px-2.5 py-1 rounded bg-[#ef4444]/15 text-[#ef4444] text-sm font-bold">50% OFF</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
                  4,990원
                </span>
                <span className="text-[var(--text-muted)] text-lg">/ 월</span>
              </div>
              <p className="text-[#f0b90b] text-sm font-semibold mt-1">
                ✨ 선착순 100명 한정 — 지금 구독하면 <span className="underline underline-offset-2">평생 이 가격</span>
              </p>
              <a
                href="/subscribe"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-[var(--text-muted)] hover:text-[#f0b90b] transition-colors"
              >
                🎁 구독하면 어떤 혜택이? <span className="underline underline-offset-2">자세히 보기 →</span>
              </a>
            </div>

            {/* Progress bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1.5">
                <span>현재 <span className="text-[#f0b90b] font-bold">{occupiedCount}명</span> 탑승 완료</span>
                <span>남은 좌석 <span className="text-white font-bold">{remaining}석</span></span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#1a1a2e] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#e74c3c] via-[#f0b90b] via-[#27ae60] to-[#3498db] transition-all duration-700"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
              {/* Color legend dots */}
              <div className="flex gap-0.5 mt-1.5">
                {SEAT_COLORS.map((c) => (
                  <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <p className="text-[var(--text-muted)] text-xs mt-4">
              월스트리트 VIP 보드에 나만의 좌석을 선점하세요!
            </p>

            {/* SNS */}
            <div className="flex items-center gap-4 mt-6 text-xs text-[var(--text-muted)] justify-center lg:justify-start">
              <a href="https://x.com/US_sokbo" target="_blank" rel="noopener noreferrer" className="hover:text-[#f0b90b] transition-colors">𝕏 @US_sokbo</a>
              <a href="https://www.threads.net/@us_sokbo" target="_blank" rel="noopener noreferrer" className="hover:text-[#f0b90b] transition-colors">🧵 Threads</a>
              <a href="https://www.instagram.com/us_sokbo/" target="_blank" rel="noopener noreferrer" className="hover:text-[#f0b90b] transition-colors">📸 Instagram</a>
            </div>
          </div>

          {/* Right: Theater seats */}
          <div className="flex-1 max-w-[640px] w-full">
            {/* 좌석 상단 안내 */}
            <div className="text-center mb-5">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
                  {occupiedCount}
                </span>
                <span className="text-2xl text-[var(--text-muted)]">/</span>
                <span className="text-2xl text-[var(--text-muted)]">100</span>
              </div>
              <p className="text-sm text-[var(--text)] font-medium mb-1">
                빈 좌석을 선점하고, 나만의 캐릭터를 채우세요!
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-2">
                구독하면 VIP 좌석에 내 캐릭터가 영구히 앉아있어요
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                🎰 <span className="text-[#f0b90b] font-bold">1·7·77·100</span>번째 구독자 → 이번 달만 내면 <span className="text-[#f0b90b] font-bold">평생 무료</span>
              </p>
            </div>

            <div
              className="overflow-x-auto pb-4"
            >
              <div className="min-w-[580px] mx-auto">
                {ROWS.map((row, rowIdx) => (
                  <div
                    key={row}
                    className="flex items-end justify-center gap-[4px] mb-[4px]"
                    style={{
                      paddingLeft: `${(9 - rowIdx) * 8}px`,
                      paddingRight: `${(9 - rowIdx) * 8}px`,
                    }}
                  >
                    {COLS.map((col) => {
                      const seatId = `${row}${col}`;
                      const data = seats[seatId];
                      const isOccupied = !!data;
                      const lucky = isLuckySeat(row, col);
                      const seatNum = getSeatNumber(row, col);

                      return (
                        <button
                          key={seatId}
                          onClick={() => {
                            if (isOccupied) return;
                            if (mySeatedId) return; // 이미 착석함
                            // 다음 순번 좌석 배정
                            let nextSeat = seatId;
                            for (let n = 1; n <= 100; n++) {
                              const id = seatIdByOrder(n);
                              if (!seats[id]) { nextSeat = id; break; }
                            }
                            if (isSubscribed) setSelectedSeat(nextSeat);
                            else setSubscribeSeat(nextSeat);
                          }}
                          className={`relative flex items-end justify-center transition-all duration-200 group ${
                            isOccupied ? "cursor-default" : "cursor-pointer"
                          }`}
                          style={{ width: "54px", height: "64px" }}
                          title={isOccupied ? `${data.initial} (${row}${col})` : lucky ? `🎰 ${seatNum}번째 — 평생 무료!` : `${row}${col} — 빈 좌석`}
                        >
                          {/* Lucky seat glow */}
                          {lucky && (
                            <div className={`absolute inset-0 rounded-lg border-2 border-[#f0b90b]/50 pointer-events-none z-10 ${!isOccupied ? "animate-pulse" : ""}`}
                              style={{ boxShadow: "0 0 14px rgba(240,185,11,0.3), inset 0 0 8px rgba(240,185,11,0.1)" }}
                            />
                          )}
                          {/* Lucky badge — inside the seat */}
                          {lucky && (
                            <div className="absolute bottom-[1px] left-1/2 -translate-x-1/2 z-20 px-1.5 py-[1px] rounded-t bg-[#f0b90b] text-black text-[7px] font-black whitespace-nowrap">
                              {isOccupied ? "🎰 당첨!" : "🎰 FREE"}
                            </div>
                          )}
                          {/* Seat back */}
                          <div
                            className={`absolute inset-x-[2px] top-0 bottom-[12px] rounded-t-lg transition-all duration-200 ${
                              !isOccupied ? "group-hover:border-[#f0b90b]/40 group-hover:bg-[#1a1a2e]" : ""
                            }`}
                            style={{
                              backgroundColor: isOccupied
                                ? lucky ? `${data.hoodieColor}20` : `${data.hoodieColor}15`
                                : lucky ? "#1a1510" : "#111118",
                              border: `1px solid ${
                                lucky ? "#f0b90b40"
                                : isOccupied ? `${data.hoodieColor}30` : "#1e1e2e"
                              }`,
                              boxShadow: lucky
                                ? `0 0 12px rgba(240,185,11,0.25), inset 0 -4px 8px rgba(240,185,11,0.05)`
                                : isOccupied
                                  ? `0 0 8px ${data.hoodieColor}15, inset 0 -4px 8px ${data.hoodieColor}10`
                                  : "inset 0 -4px 8px rgba(0,0,0,0.3)",
                            }}
                          />
                          {/* Seat bottom cushion */}
                          <div
                            className="absolute inset-x-[1px] bottom-0 h-[14px] rounded-b-md"
                            style={{
                              backgroundColor: isOccupied ? `${data.hoodieColor}25` : "#0d0d15",
                              borderLeft: `1px solid ${isOccupied ? `${data.hoodieColor}20` : "#1a1a25"}`,
                              borderRight: `1px solid ${isOccupied ? `${data.hoodieColor}20` : "#1a1a25"}`,
                              borderBottom: `1px solid ${isOccupied ? `${data.hoodieColor}20` : "#1a1a25"}`,
                            }}
                          />
                          {/* Character or empty */}
                          {isOccupied ? (
                            <div className="relative z-10 mb-[10px]">
                              <Character
                                hoodieColor={data.hoodieColor}
                                eyeStyle={data.eyeStyle}
                                hairStyle={data.hairStyle}
                                initial={data.initial}
                                size={42}
                              />
                            </div>
                          ) : (
                            <div className="relative z-10 mb-[16px] opacity-20 group-hover:opacity-50 transition-opacity">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#555" strokeWidth="1" strokeDasharray="3 3" />
                                <path d="M12 8v8M8 12h8" stroke="#555" strokeWidth="1" strokeLinecap="round" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom fixed CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a15]/90 backdrop-blur-lg border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-4">
            <a href="/news" className="text-xs text-[var(--text-muted)] hover:text-white transition-colors">📰 뉴스</a>
            <a href="/" className="text-xs text-[var(--text-muted)] hover:text-white transition-colors">🏠 홈</a>
            <a href="/briefing" className="text-xs text-[var(--text-muted)] hover:text-white transition-colors">❤️ 브리핑</a>
          </div>
          <button
            onClick={() => {
              if (mySeatedId) return; // 이미 착석
              for (let n = 1; n <= 100; n++) {
                const id = seatIdByOrder(n);
                if (!seats[id]) {
                  if (isSubscribed) setSelectedSeat(id);
                  else setSubscribeSeat(id);
                  return;
                }
              }
            }}
            className={`mx-auto sm:mx-0 px-8 py-2.5 rounded-lg font-bold text-sm transition-opacity shadow-lg ${
              mySeatedId
                ? "bg-[var(--card)] text-[var(--text-muted)] cursor-default shadow-none"
                : "bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black hover:opacity-90 shadow-[#f0b90b]/20"
            }`}
          >
            {mySeatedId ? "✅ 착석 완료" : isSubscribed ? "내 자리 꾸미기" : "구독하고 착석하기"}
          </button>
          <div className="hidden sm:block">
            <span className="text-xs text-[var(--text-muted)]">{remaining}석 남음</span>
          </div>
        </div>
      </div>

      {/* Bottom spacer for fixed bar */}
      <div className="h-16" />

      {/* Disclaimer */}
      <div className="text-center py-4 text-[10px] text-[var(--text-muted)]/40">
        본 서비스는 투자 조언이 아닌 정보 제공 목적입니다 · © 2026 US속보
      </div>

      {/* Subscribe Modal */}
      {subscribeSeat && (
        <SubscribeModal
          seatId={subscribeSeat}
          onClose={() => setSubscribeSeat(null)}
          onSubscribed={() => {
            setIsSubscribed(true);
            const seat = subscribeSeat;
            setSubscribeSeat(null);
            setSelectedSeat(seat);
          }}
        />
      )}

      {/* Character Modal */}
      {selectedSeat && (
        <CharacterModal
          seatId={selectedSeat}
          onClose={() => setSelectedSeat(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
