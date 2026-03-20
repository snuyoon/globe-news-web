"use client";

import { useState } from "react";

interface SubscribeModalProps {
  seatId: string;
  onClose: () => void;
  onSubscribed: () => void; // 구독 완료 후 캐릭터 커스텀으로
}

export default function SubscribeModal({ seatId, onClose, onSubscribed }: SubscribeModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"info" | "processing" | "done">("info");

  const handleSubmit = () => {
    if (!email.trim() || !name.trim()) return;
    setStep("processing");

    // 구독 정보 localStorage 저장 (나중에 Supabase + 결제 연동)
    const subData = { email, name, seatId, subscribedAt: new Date().toISOString() };
    localStorage.setItem("us_sokbo_subscription", JSON.stringify(subData));

    setTimeout(() => {
      setStep("done");
      setTimeout(() => onSubscribed(), 800);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#12121a] border border-[var(--border)] rounded-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="h-2 bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]" />

        <div className="p-6">
          {step === "info" && (
            <>
              {/* Seat info */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0b90b]/10 border border-[#f0b90b]/20 mb-3">
                  <span className="text-[#f0b90b] text-xs font-semibold">💺 {seatId}석 선택</span>
                </div>
                <h2 className="text-xl font-extrabold mb-1">월스트리트 VIP 구독</h2>
                <p className="text-[var(--text-muted)] text-sm">구독 후 나만의 캐릭터로 착석하세요</p>
              </div>

              {/* Pricing */}
              <div className="bg-[#0a0a12] rounded-xl p-4 mb-5 border border-[var(--border)]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[var(--text-muted)] line-through text-sm">월 9,900원</span>
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-[#ef4444]/20 text-[#ef4444] text-[10px] font-bold">50% OFF</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">4,990원</span>
                    <span className="text-[var(--text-muted)] text-xs ml-1">/월</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-2"><span className="text-[#22c55e]">✓</span> 실시간 미국 금융 속보 알림</div>
                  <div className="flex items-center gap-2"><span className="text-[#22c55e]">✓</span> 매일 모닝/장전 카드뉴스 브리핑</div>
                  <div className="flex items-center gap-2"><span className="text-[#22c55e]">✓</span> 주말 특별판 교육 콘텐츠</div>
                  <div className="flex items-center gap-2"><span className="text-[#22c55e]">✓</span> VIP 전용 좌석 + 나만의 캐릭터</div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-1 block">이름</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a12] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/40 focus:outline-none focus:border-[#f0b90b]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] mb-1 block">이메일</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a12] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/40 focus:outline-none focus:border-[#f0b90b]/50 transition-colors"
                  />
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={!email.trim() || !name.trim()}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                4,990원 결제하고 착석하기
              </button>

              <p className="text-center text-[10px] text-[var(--text-muted)]/50 mt-3">
                선착순 100명 한정 · 프로모션 종료 후 정상가(9,900원) 적용
              </p>
            </>
          )}

          {step === "processing" && (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-2 border-[#f0b90b] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[var(--text-muted)]">결제 처리 중...</p>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-lg font-bold mb-1">구독 완료!</h3>
              <p className="text-sm text-[var(--text-muted)]">이제 나만의 캐릭터를 만들어보세요</p>
            </div>
          )}

          {/* Close */}
          {step === "info" && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
