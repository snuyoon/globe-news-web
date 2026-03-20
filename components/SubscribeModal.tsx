"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

interface SubscribeModalProps {
  seatId: string;
  onClose: () => void;
  onSubscribed: () => void;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function SubscribeModal({ seatId, onClose, onSubscribed }: SubscribeModalProps) {
  const { user, signInWithGoogle } = useAuth();
  const [step, setStep] = useState<"info" | "processing" | "done">("info");

  const handleTestPayment = () => {
    if (!user) return;
    setStep("processing");

    // 테스트 결제 시뮬레이션 (나중에 포트원 연동)
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
                  <span className="text-[#f0b90b] text-xs font-semibold">{seatId}석 선택</span>
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
                  <div className="flex items-center gap-2"><span className="text-[#22c55e]">&#10003;</span> 실시간 미국 금융 속보 알림</div>
                  <div className="flex items-center gap-2"><span className="text-[#22c55e]">&#10003;</span> 매일 모닝/장전 카드뉴스 브리핑</div>
                  <div className="flex items-center gap-2"><span className="text-[#22c55e]">&#10003;</span> 주말 특별판 교육 콘텐츠</div>
                  <div className="flex items-center gap-2"><span className="text-[#22c55e]">&#10003;</span> VIP 전용 좌석 + 나만의 캐릭터</div>
                </div>
              </div>

              {/* 로그인 상태에 따라 분기 */}
              {user ? (
                <>
                  {/* 로그인된 사용자 정보 표시 */}
                  <div className="flex items-center gap-3 mb-5 px-3 py-2.5 rounded-lg bg-[#0a0a12] border border-[var(--border)]">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt=""
                        width={36}
                        height={36}
                        className="rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#f0b90b] flex items-center justify-center text-black text-sm font-bold">
                        {(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)] truncate">
                        {user.user_metadata?.full_name || "사용자"}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
                    </div>
                    <span className="text-[10px] text-[#22c55e] font-semibold px-2 py-0.5 rounded bg-[#22c55e]/10">로그인됨</span>
                  </div>

                  {/* 테스트 결제 CTA */}
                  <button
                    onClick={handleTestPayment}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    테스트 결제하고 착석하기
                  </button>
                  <p className="text-center text-[10px] text-[var(--text-muted)]/50 mt-2">
                    결제 시스템 준비 중 — 테스트 결제로 진행됩니다
                  </p>
                </>
              ) : (
                <>
                  {/* 로그인 필요 */}
                  <div className="text-center mb-4">
                    <p className="text-sm text-[var(--text-muted)] mb-4">
                      구독하려면 먼저 구글 로그인이 필요합니다
                    </p>
                    <button
                      onClick={signInWithGoogle}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-white text-[#333] font-bold text-sm hover:bg-gray-100 transition-colors"
                    >
                      <GoogleIcon />
                      구글 계정으로 로그인
                    </button>
                  </div>
                </>
              )}

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
              <div className="text-4xl mb-3">&#127881;</div>
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
