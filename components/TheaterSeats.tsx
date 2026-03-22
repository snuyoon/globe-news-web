"use client";

import { useEffect, useState, useCallback } from "react";
import Character, { type EyeStyle, type HairStyle } from "./Character";
import CharacterModal, { type SeatData } from "./CharacterModal";
import SubscribeModal from "./SubscribeModal";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";

const ROWS = "ABCDEFGHIJ".split("");
const COLS = Array.from({ length: 10 }, (_, i) => i + 1);

// 럭키넘버: 좌석 순번 (A1=1, A2=2, ... J10=100)
const LUCKY_NUMBERS = new Set([1, 7, 77, 100]);
function getSeatNumber(row: string, col: number): number {
  return ROWS.indexOf(row) * 10 + col;
}
function isLuckySeat(row: string, col: number): boolean {
  return LUCKY_NUMBERS.has(getSeatNumber(row, col));
}

const SEAT_COLORS = ["#e74c3c", "#3498db", "#f1c40f", "#9b59b6", "#e91e8a", "#27ae60", "#ef6d09", "#1abc9c"];

// 좌석 순서: A1=1, A2=2, ... A10=10, B1=11, ... J10=100
function seatIdByOrder(n: number): string {
  const row = ROWS[Math.floor((n - 1) / 10)];
  const col = ((n - 1) % 10) + 1;
  return `${row}${col}`;
}

interface SubscriberRow {
  seat_number: number;
  character_data: SeatData | null;
  is_lucky: boolean;
  user_id: string;
}

export default function TheaterSeats() {
  const { user } = useAuth();
  const [seats, setSeats] = useState<Record<string, SeatData>>({});
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [subscribeSeat, setSubscribeSeat] = useState<string | null>(null);
  const [mySeatedId, setMySeatedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);

  // Supabase에서 좌석 데이터 로드
  const loadSeats = useCallback(async () => {
    const { data, error } = await supabase
      .from("subscribers")
      .select("seat_number, character_data, is_lucky, user_id")
      .order("seat_number");

    if (error) {
      console.error("좌석 데이터 로드 실패:", error);
      setDbLoading(false);
      return;
    }

    const seatMap: Record<string, SeatData> = {};
    let myId: string | null = null;

    (data as SubscriberRow[]).forEach((row) => {
      if (row.seat_number && row.character_data) {
        const id = seatIdByOrder(row.seat_number);
        seatMap[id] = row.character_data;
        if (user && row.user_id === user.id) {
          myId = id;
        }
      }
    });

    setSeats(seatMap);
    setMySeatedId(myId);
    setDbLoading(false);
  }, [user]);

  useEffect(() => {
    setMounted(true);
    loadSeats();
  }, [loadSeats]);

  // #subscribe 앵커 처리
  useEffect(() => {
    if (!mounted || dbLoading) return;
    if (window.location.hash === "#subscribe" && !mySeatedId) {
      setTimeout(() => {
        for (let n = 1; n <= 100; n++) {
          const id = seatIdByOrder(n);
          if (!seats[id]) {
            setSubscribeSeat(id);
            break;
          }
        }
      }, 500);
    }
  }, [mounted, dbLoading, mySeatedId, seats]);

  // 다음 빈 좌석 번호 구하기
  const getNextSeatNumber = useCallback((): number | null => {
    for (let n = 1; n <= 100; n++) {
      const id = seatIdByOrder(n);
      if (!seats[id]) return n;
    }
    return null;
  }, [seats]);

  // CustomEvent "open-subscribe" 수신 (네비바 구독하기 버튼)
  useEffect(() => {
    const handler = () => {
      if (mySeatedId) return;
      const nextNum = getNextSeatNumber();
      if (nextNum === null) return;
      const nextId = seatIdByOrder(nextNum);
      setSubscribeSeat(nextId);
    };
    window.addEventListener("open-subscribe", handler);
    return () => window.removeEventListener("open-subscribe", handler);
  }, [mySeatedId, getNextSeatNumber]);

  const handleSave = useCallback(async (seatId: string, data: SeatData, topicRequest?: string) => {
    if (!user) return;

    const nextNum = getNextSeatNumber();
    if (nextNum === null) return;

    const lucky = LUCKY_NUMBERS.has(nextNum);

    const { error } = await supabase.from("subscribers").upsert({
      user_id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
      seat_number: nextNum,
      character_data: data,
      topic_request: topicRequest || null,
      payment_status: "active",
      is_lucky: lucky,
    }, { onConflict: "user_id" });

    if (error) {
      console.error("착석 실패:", error);
      alert("착석에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    // 성공: UI 업데이트
    const actualSeatId = seatIdByOrder(nextNum);
    setSeats((prev) => ({ ...prev, [actualSeatId]: data }));
    setMySeatedId(actualSeatId);
    setSelectedSeat(null);
  }, [user, getNextSeatNumber]);

  const occupiedCount = Object.keys(seats).length;
  const remaining = 100 - occupiedCount;
  const fillPercent = occupiedCount;

  if (!mounted || dbLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-[var(--text-muted)] animate-pulse">불러오는 중...</div></div>;
  }

  // 좌석 클릭 핸들러
  const handleSeatClick = () => {
    if (mySeatedId) return;
    const nextNum = getNextSeatNumber();
    if (nextNum === null) return;
    const nextId = seatIdByOrder(nextNum);

    if (!user) {
      // 로그인 안 됨 → 구독 모달에서 로그인 유도
      setSubscribeSeat(nextId);
    } else {
      // 로그인됨 → 구독 모달 (결제 단계)
      setSubscribeSeat(nextId);
    }
  };

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
                <span className="text-3xl md:text-5xl lg:text-6xl font-black text-[#22c55e]">
                  무료 체험
                </span>
                <span className="text-[var(--text-muted)] text-lg">중</span>
              </div>
              <p className="text-[#22c55e] text-sm font-semibold mt-1">
                4월 무료 체험 · <span className="text-[#f0b90b]">5월 1일 정식 오픈</span>
              </p>
              <a
                href="/subscribe"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-[var(--text-muted)] hover:text-[#f0b90b] transition-colors"
              >
                구독하면 어떤 혜택이? <span className="underline underline-offset-2">자세히 보기</span>
              </a>
              <p className="mt-3 text-xs text-[var(--text-muted)] bg-[#f0b90b]/[0.06] border border-[#f0b90b]/15 rounded-lg px-3 py-2 text-center lg:text-left">
                회원가입만 해도 <span className="text-[#f0b90b] font-bold">카드뉴스 2건 + 뉴스 5건</span> 무료 체험
              </p>
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
              4월 무료 체험 중 · 5월 1일 정식 오픈 · 선착순 100석 한정
            </p>

            {/* SNS */}
            <div className="flex items-center gap-4 mt-6 text-xs text-[var(--text-muted)] justify-center lg:justify-start">
              <a href="https://x.com/US_sokbo" target="_blank" rel="noopener noreferrer" className="hover:text-[#f0b90b] transition-colors">X @US_sokbo</a>
              <a href="https://www.threads.net/@us_sokbo" target="_blank" rel="noopener noreferrer" className="hover:text-[#f0b90b] transition-colors">Threads</a>
              <a href="https://www.instagram.com/us_sokbo/" target="_blank" rel="noopener noreferrer" className="hover:text-[#f0b90b] transition-colors">Instagram</a>
            </div>
          </div>

          {/* Right: Theater seats */}
          <div className="flex-1 max-w-[640px] w-full">
            {/* 좌석 상단 안내 */}
            <div className="text-center mb-5">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
                  {occupiedCount}
                </span>
                <span className="text-2xl text-[var(--text-muted)]">/</span>
                <span className="text-2xl text-[var(--text-muted)]">100</span>
              </div>
              <p className="text-sm text-[var(--text)] font-medium mb-1">
                지금은 <span className="text-[#22c55e] font-bold">무료 체험</span> 기간!
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-2">
                5월 1일 정식 오픈 · 지금 착석하고 모든 기능을 무료로 체험하세요
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                <span className="text-[#f0b90b] font-bold">1, 7, 77, 100</span>번째 구독자 → 5월 오픈 시 <span className="text-[#f0b90b] font-bold">Pro 평생 무료</span>
              </p>
            </div>

            <div className="overflow-x-auto pb-4">
              <div className="min-w-0 md:min-w-[580px] mx-auto">
                {ROWS.map((row) => (
                  <div
                    key={row}
                    className="flex items-center justify-center gap-[3px] md:gap-[5px] mb-[3px] md:mb-[5px]"
                  >
                    {COLS.map((col) => {
                      const seatId = `${row}${col}`;
                      const data = seats[seatId];
                      const isOccupied = !!data;
                      const lucky = isLuckySeat(row, col);
                      const seatNum = getSeatNumber(row, col);
                      const glowColor = isOccupied ? data.hoodieColor : "";
                      const frameStyle = isOccupied ? (data.frame || "none") : "none";
                      const frameBorder = frameStyle === "gold" ? "#f0b90b"
                        : frameStyle === "diamond" ? "#c0c0c0"
                        : frameStyle === "flame" ? "#ef6d09"
                        : null;

                      return (
                        <button
                          key={seatId}
                          onClick={() => {
                            if (isOccupied) return;
                            if (mySeatedId) return;
                            handleSeatClick();
                          }}
                          className={`relative flex flex-col items-center justify-end transition-all duration-300 group ${
                            isOccupied ? "cursor-default" : "cursor-pointer hover:scale-105"
                          }`}
                          style={{ width: "clamp(56px, 9.5vw, 70px)", height: "clamp(78px, 14vw, 96px)" }}
                          title={isOccupied ? `${data.initial} (${row}${col})` : lucky ? `${seatNum}번째 — 평생 무료!` : `${row}${col} — 빈 좌석`}
                        >
                          {/* Neon glow behind occupied seat */}
                          {isOccupied && (
                            <div
                              className="absolute inset-[-4px] rounded-xl pointer-events-none z-0"
                              style={{
                                background: `radial-gradient(ellipse at center, ${glowColor}40 0%, ${glowColor}15 40%, transparent 70%)`,
                                filter: "blur(3px)",
                              }}
                            />
                          )}

                          {/* Lucky seat glow */}
                          {lucky && !isOccupied && (
                            <div
                              className="absolute inset-[-2px] rounded-xl pointer-events-none z-0 animate-pulse"
                              style={{
                                background: "radial-gradient(ellipse at center, rgba(240,185,11,0.25) 0%, transparent 70%)",
                                filter: "blur(2px)",
                              }}
                            />
                          )}

                          {/* Seat shell */}
                          <div
                            className={`absolute inset-0 rounded-xl overflow-hidden transition-all duration-300 ${
                              !isOccupied && !lucky ? "group-hover:border-[#f0b90b]/30" : ""
                            }`}
                            style={{
                              background: isOccupied
                                ? `linear-gradient(180deg, ${glowColor}18 0%, ${glowColor}08 100%)`
                                : lucky
                                  ? "linear-gradient(180deg, #1a1510 0%, #0f0f18 100%)"
                                  : "linear-gradient(180deg, #1a1a25 0%, #111118 100%)",
                              border: `${frameBorder ? "2px" : "1.5px"} solid ${
                                frameBorder ? `${frameBorder}90`
                                : isOccupied ? `${glowColor}50`
                                : lucky ? "#f0b90b40"
                                : "#222233"
                              }`,
                              boxShadow: frameBorder
                                ? `0 0 12px ${frameBorder}30, 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 ${frameBorder}20`
                                : isOccupied
                                ? `0 0 16px ${glowColor}25, 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 ${glowColor}15`
                                : lucky
                                  ? "0 0 12px rgba(240,185,11,0.15), 0 4px 12px rgba(0,0,0,0.4)"
                                  : "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
                            }}
                          >
                            {/* Seat back top ridge */}
                            <div
                              className="h-[3px]"
                              style={{
                                background: frameBorder
                                  ? `linear-gradient(90deg, transparent, ${frameBorder}80, transparent)`
                                  : isOccupied
                                  ? `linear-gradient(90deg, transparent, ${glowColor}60, transparent)`
                                  : lucky
                                    ? "linear-gradient(90deg, transparent, #f0b90b40, transparent)"
                                    : "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
                              }}
                            />
                            {/* Seat cushion bottom */}
                            <div
                              className="absolute bottom-0 left-0 right-0 h-[30%] rounded-b-xl"
                              style={{
                                background: isOccupied
                                  ? `linear-gradient(0deg, ${glowColor}20 0%, transparent 100%)`
                                  : "linear-gradient(0deg, rgba(0,0,0,0.3) 0%, transparent 100%)",
                              }}
                            />
                          </div>

                          {/* Lucky badge */}
                          {lucky && (
                            <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 z-20 px-1.5 py-[1px] rounded-t bg-[#f0b90b] text-black text-[7px] font-black whitespace-nowrap">
                              {isOccupied ? "당첨!" : "FREE"}
                            </div>
                          )}

                          {/* Character or empty */}
                          {isOccupied ? (
                            <div className="relative z-10 -mb-[2px]">
                              <Character
                                hoodieColor={data.hoodieColor}
                                eyeStyle={data.eyeStyle}
                                hairStyle={data.hairStyle}
                                skinTone={data.skinTone}
                                accessory={data.accessory}
                                initial={data.initial}
                                size={78}
                              />
                            </div>
                          ) : (
                            <div className="relative z-10 mb-[14px] opacity-15 group-hover:opacity-40 transition-opacity">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="8" r="4" stroke="#555" strokeWidth="1" />
                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#555" strokeWidth="1" strokeLinecap="round" />
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
            <a href="/news" className="text-xs text-[var(--text-muted)] hover:text-white transition-colors">뉴스</a>
            <a href="/" className="text-xs text-[var(--text-muted)] hover:text-white transition-colors">홈</a>
          </div>
          <button
            onClick={handleSeatClick}
            className={`mx-auto sm:mx-0 px-8 py-2.5 rounded-lg font-bold text-sm transition-opacity shadow-lg ${
              mySeatedId
                ? "bg-[var(--card)] text-[var(--text-muted)] cursor-default shadow-none"
                : "bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black hover:opacity-90 shadow-[#f0b90b]/20"
            }`}
          >
            {mySeatedId ? "착석 완료" : "구독하고 착석하기"}
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
        본 서비스는 투자 조언이 아닌 정보 제공 목적입니다 · 2026 US속보
      </div>

      {/* Subscribe Modal */}
      {subscribeSeat && (
        <SubscribeModal
          seatId={subscribeSeat}
          onClose={() => setSubscribeSeat(null)}
          onSubscribed={() => {
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
