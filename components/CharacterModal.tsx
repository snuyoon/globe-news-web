"use client";

import { useState } from "react";
import Character, { type EyeStyle, type HairStyle, type FrameStyle, type AccessoryStyle, type SkinTone, SKIN_TONES } from "./Character";

const COLORS = [
  { name: "검정", hex: "#2d2d3d" },
  { name: "빨강", hex: "#e74c3c" },
  { name: "파랑", hex: "#3498db" },
  { name: "초록", hex: "#27ae60" },
  { name: "노랑", hex: "#f1c40f" },
  { name: "보라", hex: "#9b59b6" },
  { name: "핑크", hex: "#e91e8a" },
  { name: "하양", hex: "#bdc3c7" },
];

const EYE_OPTIONS: { label: string; value: EyeStyle }[] = [
  { label: ".", value: "dot" },
  { label: "O", value: "round" },
  { label: "^", value: "happy" },
  { label: "*", value: "star" },
  { label: ";)", value: "wink" },
  { label: "**", value: "sparkle" },
];

const HAIR_OPTIONS: { label: string; value: HairStyle }[] = [
  { label: "앞머리", value: "bangs" },
  { label: "가르마", value: "parted" },
  { label: "없음", value: "none" },
  { label: "곱슬", value: "curly" },
  { label: "뾰족", value: "spiky" },
  { label: "단발", value: "bob" },
];

interface CharacterModalProps {
  seatId: string;
  onClose: () => void;
  onSave: (seatId: string, data: SeatData, topicRequest?: string) => void;
}

const FRAME_OPTIONS: { label: string; value: FrameStyle; desc: string }[] = [
  { label: "없음", value: "none", desc: "" },
  { label: "골드", value: "gold", desc: "S1 전용" },
  { label: "다이아", value: "diamond", desc: "S1 전용" },
  { label: "불꽃", value: "flame", desc: "S1 전용" },
];

const ACCESSORY_OPTIONS: { label: string; value: AccessoryStyle }[] = [
  { label: "없음", value: "none" },
  { label: "선글라스", value: "sunglasses" },
  { label: "안경", value: "glasses" },
  { label: "에비에이터", value: "aviator" },
  { label: "모노클", value: "monocle" },
];

export interface SeatData {
  initial: string;
  hoodieColor: string;
  eyeStyle: EyeStyle;
  hairStyle: HairStyle;
  skinTone?: SkinTone;
  frame?: FrameStyle;
  accessory?: AccessoryStyle;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function CharacterModal({ seatId, onClose, onSave }: CharacterModalProps) {
  const [hoodieColor, setHoodieColor] = useState(COLORS[2].hex);
  const [eyeStyle, setEyeStyle] = useState<EyeStyle>("dot");
  const [hairStyle, setHairStyle] = useState<HairStyle>("bangs");
  const [skinTone, setSkinTone] = useState<SkinTone>("#fce4c8");
  const [frame, setFrame] = useState<FrameStyle>("none");
  const [accessory, setAccessory] = useState<AccessoryStyle>("none");
  const [initial, setInitial] = useState("");
  const [topicRequest, setTopicRequest] = useState("");

  const row = seatId[0];
  const col = seatId.slice(1);

  const handleRandom = () => {
    setHoodieColor(randomPick(COLORS).hex);
    setEyeStyle(randomPick(EYE_OPTIONS).value);
    setHairStyle(randomPick(HAIR_OPTIONS).value);
    setSkinTone(randomPick(SKIN_TONES).value);
    setFrame(randomPick(FRAME_OPTIONS).value);
    setAccessory(randomPick(ACCESSORY_OPTIONS).value);
    if (!initial) {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      setInitial(randomPick(letters.split("")) + randomPick(letters.split("")));
    }
  };

  const handleSave = () => {
    if (!initial.trim()) return;
    onSave(seatId, { initial: initial.trim(), hoodieColor, eyeStyle, hairStyle, skinTone, frame, accessory }, topicRequest.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[#16161e] p-4 md:p-8 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <h3 className="text-lg font-bold mb-1">🎉 구독 완료! 내 캐릭터 만들기</h3>
        <p className="text-[13px] text-[var(--text-muted)] mb-4">
          {row}행 {col}번 좌석 · 나만의 캐릭터를 만들어 착석하세요
        </p>

        {/* 랜덤 생성 버튼 */}
        <button
          onClick={handleRandom}
          className="w-full mb-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--text-muted)] hover:text-white hover:border-[#f0b90b]/30 transition-all"
        >
          🎲 랜덤 캐릭터 생성 (귀찮으면 이거!)
        </button>

        {/* Preview */}
        <div className="flex justify-center mb-5 bg-[#1a1a2e] rounded-xl py-5">
          <Character
            hoodieColor={hoodieColor}
            eyeStyle={eyeStyle}
            hairStyle={hairStyle}
            skinTone={skinTone}
            frame={frame}
            accessory={accessory}
            initial={initial || "?"}
            size={140}
          />
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-muted)] mb-2">옷 색상</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setHoodieColor(c.hex)}
                  className="w-9 h-9 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: hoodieColor === c.hex ? "#f0b90b" : "transparent",
                    boxShadow: hoodieColor === c.hex ? "0 0 0 2px #f0b90b40" : "none",
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-muted)] mb-2">눈 스타일</label>
            <div className="flex gap-2">
              {EYE_OPTIONS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setEyeStyle(e.value)}
                  className={`w-12 h-12 rounded-lg border text-lg font-bold transition-all ${
                    eyeStyle === e.value
                      ? "border-[#f0b90b] bg-[#f0b90b]/10 text-[#f0b90b]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-muted)] mb-2">머리카락</label>
            <div className="flex gap-2 flex-wrap">
              {HAIR_OPTIONS.map((h) => (
                <button
                  key={h.value}
                  onClick={() => setHairStyle(h.value)}
                  className={`px-4 py-2 rounded-lg border text-[13px] font-medium transition-all ${
                    hairStyle === h.value
                      ? "border-[#f0b90b] bg-[#f0b90b]/10 text-[#f0b90b]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-muted)] mb-2">이니셜 (2글자)</label>
            <input
              type="text"
              maxLength={2}
              value={initial}
              onChange={(e) => setInitial(e.target.value.toUpperCase())}
              placeholder="SJ"
              className="w-24 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-center text-lg font-bold text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#f0b90b]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-muted)] mb-2">피부색</label>
            <div className="flex gap-2">
              {SKIN_TONES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSkinTone(t.value)}
                  className="w-9 h-9 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: t.value,
                    borderColor: skinTone === t.value ? "#f0b90b" : "transparent",
                    boxShadow: skinTone === t.value ? "0 0 0 2px #f0b90b40" : "none",
                  }}
                  title={t.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-muted)] mb-2">테두리 <span className="text-[10px] text-[#f0b90b]">시즌 1 전용</span></label>
            <div className="flex gap-2 flex-wrap">
              {FRAME_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFrame(f.value)}
                  className={`px-4 py-2 rounded-lg border text-[13px] font-medium transition-all ${
                    frame === f.value
                      ? "border-[#f0b90b] bg-[#f0b90b]/10 text-[#f0b90b]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-muted)] mb-2">액세서리</label>
            <div className="flex gap-2 flex-wrap">
              {ACCESSORY_OPTIONS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAccessory(a.value)}
                  className={`px-4 py-2 rounded-lg border text-[13px] font-medium transition-all ${
                    accessory === a.value
                      ? "border-[#f0b90b] bg-[#f0b90b]/10 text-[#f0b90b]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* 주말 카드 주제 신청 */}
          <div className="pt-2 border-t border-[var(--border)]">
            <label className="block text-[13px] font-semibold text-[#f0b90b] mb-1">
              🎁 VIP 특전: 주말 카드뉴스 주제 신청
            </label>
            <p className="text-[11px] text-[var(--text-muted)] mb-2">
              선착순 100명에게만 제공! 알고 싶은 주제를 신청하면 주말 특별판에서 내 캐릭터가 직접 설명해드려요.
            </p>
            <input
              type="text"
              value={topicRequest}
              onChange={(e) => setTopicRequest(e.target.value)}
              placeholder="예: 공매도가 뭔가요? / 테슬라 실적 분석"
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-white placeholder:text-[var(--text-muted)]/40 focus:outline-none focus:border-[#f0b90b]/50"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!initial.trim()}
          className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          착석 완료!
        </button>
      </div>
    </div>
  );
}
