"use client";

interface CancelWarningModalProps {
  level: number;
  levelName: string;
  points: number;
  isFounder: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelWarningModal({
  level,
  levelName,
  points,
  isFounder,
  onClose,
  onConfirm,
}: CancelWarningModalProps) {
  const downgradedLevel = Math.max(1, level - 2);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#1a1a2e] border border-[#ef4444]/30 rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <span className="text-4xl block mb-2">&#x26A0;&#xFE0F;</span>
          <h3 className="text-lg font-bold text-white">정말 해지하시겠어요?</h3>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20">
            <span className="text-lg">&#x2B07;&#xFE0F;</span>
            <div>
              <p className="text-sm font-bold text-[#ef4444]">Lv.{level} {levelName} &#x2192; Lv.{downgradedLevel}로 강등</p>
              <p className="text-[11px] text-[var(--text-muted)]">다시 구독해도 레벨이 복구되지 않아요</p>
            </div>
          </div>

          {points > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20">
              <span className="text-lg">&#x1F4A8;</span>
              <div>
                <p className="text-sm font-bold text-[#ef4444]">보유 포인트 {points}P 전부 소멸</p>
                <p className="text-[11px] text-[var(--text-muted)]">캐릭터 꾸미기 아이템도 비활성화돼요</p>
              </div>
            </div>
          )}

          {isFounder && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f0b90b]/10 border border-[#f0b90b]/20">
              <span className="text-lg">&#x1F451;</span>
              <div>
                <p className="text-sm font-bold text-[#f0b90b]">창립 멤버 뱃지 영구 상실</p>
                <p className="text-[11px] text-[var(--text-muted)]">재구독해도 창립 멤버로 복구되지 않아요</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-lg">&#x1F6AB;</span>
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)]">VIP 콘텐츠 접근 중단</p>
              <p className="text-[11px] text-[var(--text-muted)]">상세 분석, 원문 보기, 무제한 열람 불가</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] hover:opacity-90 transition-opacity"
          >
            유지하기
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-muted)] bg-[var(--bg)] hover:bg-[var(--border)] transition-colors"
          >
            그래도 해지
          </button>
        </div>
      </div>
    </div>
  );
}
