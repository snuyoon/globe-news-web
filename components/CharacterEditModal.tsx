"use client";

import { useState } from "react";
import Character, { type EyeStyle, type HairStyle, type FrameStyle, type AccessoryStyle, type SkinTone, SKIN_TONES } from "./Character";
import { COLORS, EYE_OPTIONS, HAIR_OPTIONS, FRAME_OPTIONS, ACCESSORY_OPTIONS } from "./CharacterModal";
import { supabase } from "@/lib/supabase";

interface Props {
  userId: string;
  current: Record<string, string> | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function CharacterEditModal({ userId, current, onClose, onSaved }: Props) {
  const [hoodieColor, setHoodieColor] = useState(current?.hoodieColor || COLORS[0].hex);
  const [eyeStyle, setEyeStyle] = useState<EyeStyle>((current?.eyeStyle as EyeStyle) || "dot");
  const [hairStyle, setHairStyle] = useState<HairStyle>((current?.hairStyle as HairStyle) || "bangs");
  const [skinTone, setSkinTone] = useState<SkinTone>((current?.skinTone as SkinTone) || "#fce4c8");
  const [frame, setFrame] = useState<FrameStyle>((current?.frame as FrameStyle) || "none");
  const [accessory, setAccessory] = useState<AccessoryStyle>((current?.accessory as AccessoryStyle) || "none");
  const [initial, setInitial] = useState(current?.initial || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!initial.trim()) return;
    setSaving(true);
    const data = { initial: initial.trim(), hoodieColor, eyeStyle, hairStyle, skinTone, frame, accessory };
    await supabase.from("subscribers").update({ character_data: data }).eq("user_id", userId);
    setSaving(false);
    onSaved();
    onClose();
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

        <h3 className="text-lg font-bold mb-4">캐릭터 꾸미기</h3>

        <div className="flex justify-center mb-5 bg-[#1a1a2e] rounded-xl py-5">
          <Character
            hoodieColor={hoodieColor} eyeStyle={eyeStyle} hairStyle={hairStyle}
            skinTone={skinTone} accessory={accessory} initial={initial || "?"} size={140}
          />
        </div>

        <div className="space-y-4">
          {/* 옷 색상 */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-muted)] mb-2">옷 색상</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c.hex} onClick={() => setHoodieColor(c.hex)}
                  className="w-9 h-9 rounded-full border-2 transition-all hover:scale-110"
                  style={{ backgroundColor: c.hex, borderColor: hoodieColor === c.hex ? "#f0b90b" : "transparent", boxShadow: hoodieColor === c.hex ? "0 0 0 2px #f0b90b40" : "none" }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* 눈 */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-muted)] mb-2">눈 스타일</label>
            <div className="flex gap-2">
              {EYE_OPTIONS.map((e) => (
                <button key={e.value} onClick={() => setEyeStyle(e.value)}
                  className={`w-12 h-12 rounded-lg border text-lg font-bold transition-all ${eyeStyle === e.value ? "border-[#f0b90b] bg-[#f0b90b]/10 text-[#f0b90b]" : "border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"}`}
                >{e.label}</button>
              ))}
            </div>
          </div>

          {/* 머리 */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-muted)] mb-2">머리카락</label>
            <div className="flex gap-2 flex-wrap">
              {HAIR_OPTIONS.map((h) => (
                <button key={h.value} onClick={() => setHairStyle(h.value)}
                  className={`px-4 py-2 rounded-lg border text-[13px] font-medium transition-all ${hairStyle === h.value ? "border-[#f0b90b] bg-[#f0b90b]/10 text-[#f0b90b]" : "border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"}`}
                >{h.label}</button>
              ))}
            </div>
          </div>

          {/* 이니셜 */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-muted)] mb-2">이니셜 (2글자)</label>
            <input type="text" maxLength={2} value={initial} onChange={(e) => setInitial(e.target.value.toUpperCase())}
              placeholder="SJ" className="w-24 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-center text-lg font-bold text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#f0b90b]"
            />
          </div>

          {/* 피부색 */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-muted)] mb-2">피부색</label>
            <div className="flex gap-2">
              {SKIN_TONES.map((t) => (
                <button key={t.value} onClick={() => setSkinTone(t.value)}
                  className="w-9 h-9 rounded-full border-2 transition-all hover:scale-110"
                  style={{ backgroundColor: t.value, borderColor: skinTone === t.value ? "#f0b90b" : "transparent", boxShadow: skinTone === t.value ? "0 0 0 2px #f0b90b40" : "none" }}
                  title={t.label}
                />
              ))}
            </div>
          </div>

          {/* 테두리 */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-muted)] mb-2">테두리 <span className="text-[10px] text-[#f0b90b]">시즌 1 전용</span></label>
            <div className="flex gap-2 flex-wrap">
              {FRAME_OPTIONS.map((f) => (
                <button key={f.value} onClick={() => setFrame(f.value)}
                  className={`px-4 py-2 rounded-lg border text-[13px] font-medium transition-all ${frame === f.value ? "border-[#f0b90b] bg-[#f0b90b]/10 text-[#f0b90b]" : "border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"}`}
                >{f.label}</button>
              ))}
            </div>
          </div>

          {/* 액세서리 */}
          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-muted)] mb-2">액세서리</label>
            <div className="flex gap-2 flex-wrap">
              {ACCESSORY_OPTIONS.map((a) => (
                <button key={a.value} onClick={() => setAccessory(a.value)}
                  className={`px-4 py-2 rounded-lg border text-[13px] font-medium transition-all ${accessory === a.value ? "border-[#f0b90b] bg-[#f0b90b]/10 text-[#f0b90b]" : "border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"}`}
                >{a.label}</button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={!initial.trim() || saving}
          className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
