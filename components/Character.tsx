"use client";

import React from "react";

/* ═══════════════════════════════════════════════════════
   캐릭터 커스터마이징 시스템
   레퍼런스: character-reference.svg (viewBox 400x460)

   비율: 머리 6 : 몸통+다리 4
   레이어: 발 → 몸통 → 여밈선 → 팔 → 머리/후드 → 얼굴/눈/머리카락 → 액세서리 → 이니셜
   스타일: 외곽선 stroke=#111, 2D 플랫, 그라데이션 없음
   ═══════════════════════════════════════════════════════ */

export type EyeStyle = "dot" | "round" | "happy" | "star" | "wink" | "sparkle";
export type HairStyle = "bangs" | "parted" | "none" | "curly" | "spiky" | "bob" | "ponytail" | "twoblock" | "long" | "beanie" | "twintail" | "topknot";
export type FrameStyle = "none" | "gold" | "diamond" | "flame";
export type AccessoryStyle = "none" | "sunglasses" | "glasses" | "aviator" | "monocle" | "mask" | "bandaid" | "blush_heart";
export type SkinTone = "#ffffff" | "#fce4c8" | "#f5d0a9" | "#c68642" | "#8d5524";

export const SKIN_TONES: { label: string; value: SkinTone }[] = [
  { label: "밝은", value: "#ffffff" },
  { label: "라이트", value: "#fce4c8" },
  { label: "미디엄", value: "#f5d0a9" },
  { label: "탄", value: "#c68642" },
  { label: "다크", value: "#8d5524" },
];

export interface CharacterProps {
  hoodieColor: string;
  eyeStyle: EyeStyle;
  hairStyle: HairStyle;
  initial: string;
  size?: number;
  skinTone?: SkinTone;
  frame?: FrameStyle;
  accessory?: AccessoryStyle;
}

// 레퍼런스 viewBox 기준 상수 (400x460)
const VW = 400;
const VH = 460;
const CX = 200; // 중심 x

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}

/* ─────────────────────────────────────────
   Layer 6: Eyes (교체 가능)
   기준점: cx=200, cy=150 (레퍼런스)
   ───────────────────────────────────────── */
function Eyes({ style, color }: { style: EyeStyle; color: string }) {
  const cy = 150;
  const lx = 180; // 왼눈 x
  const rx = 220; // 오른눈 x
  const r = 7.5;

  switch (style) {
    case "dot":
      return (
        <g>
          <circle cx={lx} cy={cy} r={r} fill="#111111" stroke="none" />
          <circle cx={rx} cy={cy} r={r} fill="#111111" stroke="none" />
        </g>
      );
    case "round":
      return (
        <g>
          <circle cx={lx} cy={cy} r={10} fill="#ffffff" stroke="#111111" strokeWidth={2} />
          <circle cx={lx + 2} cy={cy + 1} r={6} fill="#111111" stroke="none" />
          <circle cx={lx + 3.5} cy={cy - 2} r={2.5} fill="#ffffff" stroke="none" />
          <circle cx={rx} cy={cy} r={10} fill="#ffffff" stroke="#111111" strokeWidth={2} />
          <circle cx={rx + 2} cy={cy + 1} r={6} fill="#111111" stroke="none" />
          <circle cx={rx + 3.5} cy={cy - 2} r={2.5} fill="#ffffff" stroke="none" />
        </g>
      );
    case "happy":
      return (
        <g>
          <path d={`M${lx - 8},${cy + 2} Q${lx},${cy - 10} ${lx + 8},${cy + 2}`} fill="none" stroke="#111111" strokeWidth={4} strokeLinecap="round" />
          <path d={`M${rx - 8},${cy + 2} Q${rx},${cy - 10} ${rx + 8},${cy + 2}`} fill="none" stroke="#111111" strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    case "star": {
      const star = (cx: number) => {
        const pts = [];
        for (let i = 0; i < 5; i++) {
          const oa = -Math.PI / 2 + (2 * Math.PI * i) / 5;
          const ia = oa + Math.PI / 5;
          pts.push(`${cx + 9 * Math.cos(oa)},${cy + 9 * Math.sin(oa)}`);
          pts.push(`${cx + 3.6 * Math.cos(ia)},${cy + 3.6 * Math.sin(ia)}`);
        }
        return pts.join(" ");
      };
      return (
        <g>
          <polygon points={star(lx)} fill="#111111" stroke="none" />
          <polygon points={star(rx)} fill="#111111" stroke="none" />
        </g>
      );
    }
    case "wink":
      return (
        <g>
          <circle cx={lx} cy={cy} r={r} fill="#111111" stroke="none" />
          <path d={`M${rx - 8},${cy} Q${rx},${cy - 8} ${rx + 8},${cy}`} fill="none" stroke="#111111" strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    case "sparkle":
      return (
        <g>
          <circle cx={lx} cy={cy} r={10} fill="#111111" stroke="none" />
          <circle cx={lx - 1} cy={cy - 2} r={4} fill="#ffffff" stroke="none" opacity={0.9} />
          <circle cx={lx + 3} cy={cy + 3} r={1.5} fill="#ffffff" stroke="none" opacity={0.7} />
          <circle cx={rx} cy={cy} r={10} fill="#111111" stroke="none" />
          <circle cx={rx - 1} cy={cy - 2} r={4} fill="#ffffff" stroke="none" opacity={0.9} />
          <circle cx={rx + 3} cy={cy + 3} r={1.5} fill="#ffffff" stroke="none" opacity={0.7} />
        </g>
      );
  }
}

/* ─────────────────────────────────────────
   Layer 6: Hair (교체 가능)
   모든 머리카락은 얼굴 원(cx=200,cy=150,r=55) 안에서만 보임.
   후드 밖으로 절대 튀어나가지 않도록 clipPath 적용.
   ───────────────────────────────────────── */
function HairContent({ style, dark }: { style: HairStyle; dark: string }) {
  // 이마 영역: y≈100~125, x≈155~245 (얼굴 원 상단)
  switch (style) {
    case "none": return null;
    case "curly":
      return (
        <g fill="none" stroke="#333" strokeWidth={3.5} strokeLinecap="round">
          <path d="M 182 118 C 184 108 189 108 191 118" />
          <path d="M 192 116 C 195 106 203 106 206 116" />
          <path d="M 207 118 C 210 108 215 108 217 118" />
        </g>
      );
    case "bangs":
      return (
        <g fill={dark} stroke="#222" strokeWidth={1.5}>
          <path d="M168,122 L172,106 L182,118 L188,102 L198,118 L205,104 L212,118 L218,108 L225,122 Z" />
        </g>
      );
    case "parted":
      return (
        <g fill={dark} stroke="#222" strokeWidth={1.5}>
          <path d="M168,122 L174,106 L184,118 L194,104 L200,120 Z" />
          <path d="M200,120 L206,104 L216,118 L226,106 L232,122 Z" />
        </g>
      );
    case "spiky":
      return (
        <g fill={dark} stroke="#222" strokeWidth={1.5}>
          <path d="M165,122 L168,98 L180,115 L188,96 L200,115 L212,96 L220,115 L232,98 L235,122 Z" />
        </g>
      );
    case "bob":
      return (
        <g fill={dark} stroke="#222" strokeWidth={1.5}>
          <ellipse cx={200} cy={112} rx={30} ry={12} />
          <rect x={168} y={112} width={11} height={30} rx={4} />
          <rect x={221} y={112} width={11} height={30} rx={4} />
        </g>
      );
    case "ponytail":
      return (
        <g fill={dark} stroke="#222" strokeWidth={1.5}>
          <path d="M168,122 L172,106 L182,118 L190,104 L200,116 L210,104 L218,118 L228,106 L232,122 Z" />
        </g>
      );
    case "twoblock":
      return (
        <g fill={dark} stroke="#222" strokeWidth={1.5}>
          <rect x={170} y={105} width={60} height={18} rx={4} />
          <path d="M180,122 L184,108 L192,118 L200,104 L208,118 L216,108 L220,122 Z" />
        </g>
      );
    case "long":
      return (
        <g fill={dark} stroke="#222" strokeWidth={1.5}>
          <path d="M168,122 L174,104 L186,118 L198,102 L210,118 L222,104 L232,122 Z" />
          <rect x={155} y={122} width={10} height={45} rx={4} />
          <rect x={235} y={122} width={10} height={45} rx={4} />
        </g>
      );
    case "beanie":
      return (
        <g stroke="#222" strokeWidth={1.5}>
          <ellipse cx={200} cy={102} rx={40} ry={20} fill={dark} />
          <rect x={158} y={112} width={84} height={12} rx={3} fill={dark} />
          <circle cx={200} cy={84} r={5} fill={dark} />
        </g>
      );
    case "twintail":
      return (
        <g fill={dark} stroke="#222" strokeWidth={1.5}>
          <path d="M175,122 L180,108 L190,118 L200,104 L210,118 L220,108 L225,122 Z" />
        </g>
      );
    case "topknot":
      return (
        <g fill={dark} stroke="#222" strokeWidth={1.5}>
          <ellipse cx={200} cy={100} rx={8} ry={6} />
        </g>
      );
  }
}

function Hair({ style, color }: { style: HairStyle; color: string }) {
  if (style === "none") return null;
  const dark = darkenColor(color, 40);
  // clipPath: 얼굴 원(cx=200,cy=150,r=55)에 맞춰 클리핑 — 후드 밖으로 안 나감
  const clipId = "hair-clip";
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <circle cx={200} cy={150} r={54} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <HairContent style={style} dark={dark} />
      </g>
    </>
  );
}

/* ─────────────────────────────────────────
   Layer 7: Accessories (on/off 토글)
   기준점: 눈 위치 cy=150
   ───────────────────────────────────────── */
function Accessory({ style }: { style: AccessoryStyle }) {
  const cy = 150;
  const lx = 180;
  const rx = 220;
  switch (style) {
    case "none": return null;
    case "sunglasses":
      return (
        <g stroke="none">
          <rect x={lx - 14} y={cy - 8} width={28} height={18} rx={6} fill="#111111" opacity={0.85} />
          <rect x={rx - 14} y={cy - 8} width={28} height={18} rx={6} fill="#111111" opacity={0.85} />
          <line x1={lx + 14} y1={cy + 1} x2={rx - 14} y2={cy + 1} stroke="#111111" strokeWidth={3} />
          <rect x={lx - 8} y={cy - 5} width={6} height={3} rx={1} fill="#ffffff" opacity={0.25} />
          <rect x={rx - 8} y={cy - 5} width={6} height={3} rx={1} fill="#ffffff" opacity={0.25} />
        </g>
      );
    case "glasses":
      return (
        <g fill="none" stroke="#8b7355" strokeWidth={2.5}>
          <circle cx={lx} cy={cy} r={14} />
          <circle cx={rx} cy={cy} r={14} />
          <line x1={lx + 14} y1={cy} x2={rx - 14} y2={cy} />
        </g>
      );
    case "aviator":
      return (
        <g stroke="none">
          <ellipse cx={lx} cy={cy + 2} rx={16} ry={13} fill="#111111" opacity={0.7} />
          <ellipse cx={rx} cy={cy + 2} rx={16} ry={13} fill="#111111" opacity={0.7} />
          <line x1={lx + 16} y1={cy - 1} x2={rx - 16} y2={cy - 1} stroke="#f0b90b" strokeWidth={2.5} />
          <ellipse cx={lx - 2} cy={cy - 2} rx={4} ry={2} fill="#ffffff" opacity={0.2} />
        </g>
      );
    case "monocle":
      return (
        <g fill="none" stroke="#f0b90b" strokeWidth={2.5}>
          <circle cx={rx} cy={cy} r={15} />
          <line x1={rx} y1={cy + 15} x2={rx - 4} y2={cy + 35} strokeLinecap="round" />
        </g>
      );
    case "mask":
      return (
        <g stroke="none">
          <rect x={165} y={158} width={70} height={30} rx={8} fill="#e0e0e0" />
          <line x1={165} y1={165} x2={148} y2={155} stroke="#c0c0c0" strokeWidth={2} />
          <line x1={235} y1={165} x2={252} y2={155} stroke="#c0c0c0" strokeWidth={2} />
          <path d="M180,170 Q200,178 220,170" fill="none" stroke="#c0c0c0" strokeWidth={1.5} />
        </g>
      );
    case "bandaid":
      return (
        <g stroke="none">
          <rect x={210} y={155} width={22} height={10} rx={3} fill="#f5c8a0" transform="rotate(-15, 221, 160)" />
          <circle cx={216} cy={159} r={1} fill="#d4a574" />
          <circle cx={221} cy={159} r={1} fill="#d4a574" />
          <circle cx={226} cy={159} r={1} fill="#d4a574" />
        </g>
      );
    case "blush_heart":
      return (
        <g stroke="none">
          <path d={`M${lx - 6},${cy + 12} C${lx - 6},${cy + 8} ${lx - 2},${cy + 8} ${lx - 2},${cy + 11} C${lx - 2},${cy + 8} ${lx + 2},${cy + 8} ${lx + 2},${cy + 12} C${lx + 2},${cy + 16} ${lx - 2},${cy + 18} ${lx - 2},${cy + 18} C${lx - 2},${cy + 18} ${lx - 6},${cy + 16} ${lx - 6},${cy + 12} Z`} fill="#ff6b9d" opacity={0.5} />
          <path d={`M${rx - 6},${cy + 12} C${rx - 6},${cy + 8} ${rx - 2},${cy + 8} ${rx - 2},${cy + 11} C${rx - 2},${cy + 8} ${rx + 2},${cy + 8} ${rx + 2},${cy + 12} C${rx + 2},${cy + 16} ${rx - 2},${cy + 18} ${rx - 2},${cy + 18} C${rx - 2},${cy + 18} ${rx - 6},${cy + 16} ${rx - 6},${cy + 12} Z`} fill="#ff6b9d" opacity={0.5} />
        </g>
      );
  }
}

/* ═══════════════════════════════════════════════════════
   Main Character — 레퍼런스 SVG 구조 그대로

   레이어 순서 (아래→위):
   1. 발
   2. 몸통 (rect, rx=20)
   3. 여밈선
   4. 팔 (물방울 path, 몸통 위!)
   5. 머리/후드 (circle)
   6. 얼굴 (circle) + 눈 + 머리카락
   7. 액세서리
   8. 이니셜
   ═══════════════════════════════════════════════════════ */
function Character({ hoodieColor, eyeStyle, hairStyle, initial, size = 120, skinTone = "#ffffff", frame = "none", accessory = "none" }: CharacterProps) {
  const footColor = darkenColor(hoodieColor, 60);

  return (
    <svg width={size} height={size * (VH / VW)} viewBox={`0 0 ${VW} ${VH}`} fill="none">

      <g stroke="#111111" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round">

        {/* ── Layer 1: 발 ── */}
        <rect x={145} y={345} width={50} height={22} rx={11} fill={footColor} />
        <rect x={205} y={345} width={50} height={22} rx={11} fill={footColor} />

        {/* ── Layer 2: 몸통 (직사각형, 모서리만 둥글게) ── */}
        <rect x={130} y={200} width={140} height={150} rx={20} fill={hoodieColor} />

        {/* ── Layer 3: 여밈 세로선 ── */}
        <line x1={200} y1={208} x2={200} y2={345} strokeWidth={5} opacity={0.8} />

        {/* ── Layer 4: 팔 (물방울 path, 몸통 위!) ── */}
        {/* 왼팔: 어깨(141,208)에서 시작, 아래로 떨어지는 물방울 */}
        <path d={`
          M 141,208
          C 135,212 124,225 115,245
          C 105,265 102,278 110,287
          C 118,296 131,292 134,280
          C 138,265 140,240 141,220
          Z
        `} fill={hoodieColor} />
        {/* 오른팔 */}
        <path d={`
          M 259,208
          C 265,212 276,225 285,245
          C 295,265 298,278 290,287
          C 282,296 269,292 266,280
          C 262,265 260,240 259,220
          Z
        `} fill={hoodieColor} />

        {/* ── Layer 5: 머리/후드 ── */}
        <circle cx={200} cy={140} r={95} fill={hoodieColor} />

        {/* ── Layer 6: 얼굴 (피부색 원) ── */}
        <circle cx={200} cy={150} r={55} fill={skinTone} />

      </g>

      {/* ── Layer 6b: 눈 (stroke 그룹 밖) ── */}
      <Eyes style={eyeStyle} color={hoodieColor} />

      {/* ── Layer 6c: 머리카락 ── */}
      <Hair style={hairStyle} color={hoodieColor} />

      {/* ── Layer 7: 액세서리 ── */}
      <Accessory style={accessory} />

      {/* ── Layer 8: 이니셜 ── */}
      <text
        x={200}
        y={295}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={36}
        fontWeight="900"
        fontFamily="sans-serif"
        opacity={0.8}
        stroke="none"
      >
        {initial}
      </text>
    </svg>
  );
}

export default React.memo(Character);
