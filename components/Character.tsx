"use client";

import React from "react";

export type EyeStyle = "dot" | "round" | "happy" | "star" | "wink" | "sparkle";
export type HairStyle = "bangs" | "parted" | "none" | "curly" | "spiky" | "bob";
export type FrameStyle = "none" | "gold" | "diamond" | "flame";
export type AccessoryStyle = "none" | "sunglasses" | "glasses" | "aviator" | "monocle";
export type SkinTone = "#fce4c8" | "#f5d0a9" | "#c68642" | "#8d5524";

export const SKIN_TONES: { label: string; value: SkinTone }[] = [
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

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}

/* ═══════════════════════════════════════════
   Layer 4: Eyes (교체 가능)
   ═══════════════════════════════════════════ */
function Eyes({ style, cx, cy, s }: { style: EyeStyle; cx: number; cy: number; s: number }) {
  const gap = 7 * s;
  switch (style) {
    case "dot":
      return (
        <>
          <ellipse cx={cx - gap} cy={cy} rx={3 * s} ry={3.5 * s} fill="#1a1a2e" />
          <ellipse cx={cx + gap} cy={cy} rx={3 * s} ry={3.5 * s} fill="#1a1a2e" />
          <circle cx={cx - gap + 1 * s} cy={cy - 1.2 * s} r={1.2 * s} fill="white" opacity={0.9} />
          <circle cx={cx + gap + 1 * s} cy={cy - 1.2 * s} r={1.2 * s} fill="white" opacity={0.9} />
        </>
      );
    case "round":
      return (
        <>
          <ellipse cx={cx - gap} cy={cy} rx={4.5 * s} ry={5 * s} fill="white" stroke="#1a1a2e" strokeWidth={0.7 * s} />
          <ellipse cx={cx - gap + 0.8 * s} cy={cy + 0.5 * s} rx={2.5 * s} ry={3 * s} fill="#1a1a2e" />
          <circle cx={cx - gap + 1.5 * s} cy={cy - 1 * s} r={1.2 * s} fill="white" opacity={0.9} />
          <ellipse cx={cx + gap} cy={cy} rx={4.5 * s} ry={5 * s} fill="white" stroke="#1a1a2e" strokeWidth={0.7 * s} />
          <ellipse cx={cx + gap + 0.8 * s} cy={cy + 0.5 * s} rx={2.5 * s} ry={3 * s} fill="#1a1a2e" />
          <circle cx={cx + gap + 1.5 * s} cy={cy - 1 * s} r={1.2 * s} fill="white" opacity={0.9} />
        </>
      );
    case "happy":
      return (
        <>
          <path d={`M${cx - gap - 3.5 * s},${cy + 1 * s} Q${cx - gap},${cy - 4.5 * s} ${cx - gap + 3.5 * s},${cy + 1 * s}`} fill="none" stroke="#1a1a2e" strokeWidth={1.8 * s} strokeLinecap="round" />
          <path d={`M${cx + gap - 3.5 * s},${cy + 1 * s} Q${cx + gap},${cy - 4.5 * s} ${cx + gap + 3.5 * s},${cy + 1 * s}`} fill="none" stroke="#1a1a2e" strokeWidth={1.8 * s} strokeLinecap="round" />
        </>
      );
    case "star":
      return (
        <>
          <StarShape cx={cx - gap} cy={cy} r={4.5 * s} />
          <StarShape cx={cx + gap} cy={cy} r={4.5 * s} />
          <circle cx={cx - gap + 1.2 * s} cy={cy - 1.5 * s} r={1 * s} fill="white" opacity={0.8} />
          <circle cx={cx + gap + 1.2 * s} cy={cy - 1.5 * s} r={1 * s} fill="white" opacity={0.8} />
        </>
      );
    case "wink":
      return (
        <>
          <ellipse cx={cx - gap} cy={cy} rx={3 * s} ry={3.5 * s} fill="#1a1a2e" />
          <circle cx={cx - gap + 1 * s} cy={cy - 1.2 * s} r={1.2 * s} fill="white" opacity={0.9} />
          <path d={`M${cx + gap - 3.5 * s},${cy} Q${cx + gap},${cy - 3.5 * s} ${cx + gap + 3.5 * s},${cy}`} fill="none" stroke="#1a1a2e" strokeWidth={1.8 * s} strokeLinecap="round" />
        </>
      );
    case "sparkle":
      return (
        <>
          <ellipse cx={cx - gap} cy={cy} rx={4.5 * s} ry={5 * s} fill="#1a1a2e" />
          <circle cx={cx - gap - 0.5 * s} cy={cy - 1 * s} r={2 * s} fill="white" opacity={0.9} />
          <circle cx={cx - gap + 1.5 * s} cy={cy + 1.5 * s} r={0.8 * s} fill="white" opacity={0.7} />
          <ellipse cx={cx + gap} cy={cy} rx={4.5 * s} ry={5 * s} fill="#1a1a2e" />
          <circle cx={cx + gap - 0.5 * s} cy={cy - 1 * s} r={2 * s} fill="white" opacity={0.9} />
          <circle cx={cx + gap + 1.5 * s} cy={cy + 1.5 * s} r={0.8 * s} fill="white" opacity={0.7} />
        </>
      );
  }
}

function StarShape({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const points = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = (Math.PI / 2) * -1 + (2 * Math.PI * i) / 5;
    const innerAngle = outerAngle + Math.PI / 5;
    points.push(`${cx + r * Math.cos(outerAngle)},${cy + r * Math.sin(outerAngle)}`);
    points.push(`${cx + r * 0.4 * Math.cos(innerAngle)},${cy + r * 0.4 * Math.sin(innerAngle)}`);
  }
  return <polygon points={points.join(" ")} fill="#1a1a2e" />;
}

/* ═══════════════════════════════════════════
   Layer 3: Hair (교체 가능)
   ═══════════════════════════════════════════ */
function HairBangs({ style, cx, cy, s, color }: { style: HairStyle; cx: number; cy: number; s: number; color: string }) {
  const dark = darkenColor(color, 50);
  switch (style) {
    case "none": return null;
    case "bangs":
      return (
        <g fill={dark}>
          <path d={`M${cx - 6 * s},${cy + 2 * s} L${cx - 7 * s},${cy - 7 * s} L${cx - 3 * s},${cy} L${cx - 1 * s},${cy - 9 * s} L${cx + 1 * s},${cy} L${cx + 4 * s},${cy - 8 * s} L${cx + 6 * s},${cy + 2 * s} Z`} />
        </g>
      );
    case "parted":
      return (
        <g fill={dark}>
          <path d={`M${cx - 9 * s},${cy + 2 * s} L${cx - 8 * s},${cy - 6 * s} L${cx - 3 * s},${cy} L${cx},${cy - 4 * s} L${cx},${cy + 2 * s} Z`} />
          <path d={`M${cx + 9 * s},${cy + 2 * s} L${cx + 8 * s},${cy - 6 * s} L${cx + 3 * s},${cy} L${cx},${cy - 4 * s} L${cx},${cy + 2 * s} Z`} />
        </g>
      );
    case "curly":
      return (
        <g fill={dark}>
          <circle cx={cx - 7 * s} cy={cy - 2 * s} r={4 * s} />
          <circle cx={cx} cy={cy - 4 * s} r={4 * s} />
          <circle cx={cx + 7 * s} cy={cy - 2 * s} r={4 * s} />
        </g>
      );
    case "spiky":
      return (
        <g fill={dark}>
          <path d={`M${cx - 8 * s},${cy + 1 * s} L${cx - 10 * s},${cy - 10 * s} L${cx - 4 * s},${cy - 2 * s} L${cx - 2 * s},${cy - 12 * s} L${cx + 2 * s},${cy - 2 * s} L${cx + 6 * s},${cy - 11 * s} L${cx + 8 * s},${cy + 1 * s} Z`} />
        </g>
      );
    case "bob":
      return (
        <g fill={dark}>
          <ellipse cx={cx} cy={cy - 1 * s} rx={12 * s} ry={6 * s} />
          <rect x={cx - 12 * s} y={cy - 1 * s} width={5 * s} height={10 * s} rx={2 * s} />
          <rect x={cx + 7 * s} y={cy - 1 * s} width={5 * s} height={10 * s} rx={2 * s} />
        </g>
      );
  }
}

/* ═══════════════════════════════════════════
   Layer 5: Accessories (on/off 토글)
   ═══════════════════════════════════════════ */
function Accessory({ style, cx, cy, s }: { style: AccessoryStyle; cx: number; cy: number; s: number }) {
  const gap = 7 * s;
  switch (style) {
    case "none": return null;
    case "sunglasses":
      return (
        <g>
          <rect x={cx - gap - 5.5 * s} y={cy - 3.5 * s} width={11 * s} height={7 * s} rx={2.5 * s} fill="#1a1a2e" opacity={0.85} />
          <rect x={cx + gap - 5.5 * s} y={cy - 3.5 * s} width={11 * s} height={7 * s} rx={2.5 * s} fill="#1a1a2e" opacity={0.85} />
          <line x1={cx - gap + 5.5 * s} y1={cy} x2={cx + gap - 5.5 * s} y2={cy} stroke="#1a1a2e" strokeWidth={1.3 * s} />
          <rect x={cx - gap - 2.5 * s} y={cy - 2.5 * s} width={2.5 * s} height={1.2 * s} rx={0.4 * s} fill="white" opacity={0.3} />
          <rect x={cx + gap - 2.5 * s} y={cy - 2.5 * s} width={2.5 * s} height={1.2 * s} rx={0.4 * s} fill="white" opacity={0.3} />
        </g>
      );
    case "glasses":
      return (
        <g>
          <circle cx={cx - gap} cy={cy} r={6 * s} fill="none" stroke="#8b7355" strokeWidth={1 * s} />
          <circle cx={cx + gap} cy={cy} r={6 * s} fill="none" stroke="#8b7355" strokeWidth={1 * s} />
          <line x1={cx - gap + 6 * s} y1={cy} x2={cx + gap - 6 * s} y2={cy} stroke="#8b7355" strokeWidth={0.8 * s} />
        </g>
      );
    case "aviator":
      return (
        <g>
          <ellipse cx={cx - gap} cy={cy + 0.5 * s} rx={6.5 * s} ry={5.5 * s} fill="#1a1a2e" opacity={0.75} />
          <ellipse cx={cx + gap} cy={cy + 0.5 * s} rx={6.5 * s} ry={5.5 * s} fill="#1a1a2e" opacity={0.75} />
          <line x1={cx - gap + 6.5 * s} y1={cy - 0.5 * s} x2={cx + gap - 6.5 * s} y2={cy - 0.5 * s} stroke="#f0b90b" strokeWidth={1 * s} />
          <ellipse cx={cx - gap - 0.5 * s} cy={cy - 0.5 * s} rx={1.5 * s} ry={0.8 * s} fill="white" opacity={0.2} />
        </g>
      );
    case "monocle":
      return (
        <g>
          <circle cx={cx + gap} cy={cy} r={6.5 * s} fill="none" stroke="#f0b90b" strokeWidth={1 * s} />
          <line x1={cx + gap} y1={cy + 6.5 * s} x2={cx + gap - 1.5 * s} y2={cy + 13 * s} stroke="#f0b90b" strokeWidth={0.7 * s} strokeLinecap="round" />
        </g>
      );
  }
}

/* ═══════════════════════════════════════════
   Layer 1: Body Silhouette (단일 path — 핵심)
   후드+몸통 일체형 벨 쉐이프.
   팔은 실루엣에 포함 (별도 도형 없음).
   ═══════════════════════════════════════════ */
function BellBody({ cx, s, color, darker, lighter }: { cx: number; s: number; color: string; darker: string; lighter: string }) {
  // 비율 후드:몸:다리 = 45:45:10  →  viewBox 100 기준: 후드 0~45, 몸 45~90, 다리 90~100
  // 단일 path: 후드 원 상단 → 좌측 어깨 → 좌측 팔(몸에 포함) → 좌하단 → 우하단 → 우측 팔 → 우측 어깨 → 다시 상단
  const path = [
    // 후드 상단 시작 (12시 방향에서 시계방향)
    `M${cx},${3 * s}`,
    // 후드 좌측 곡선
    `C${cx - 28 * s},${3 * s} ${cx - 32 * s},${28 * s} ${cx - 28 * s},${40 * s}`,
    // 좌측 어깨 → 팔(몸 실루엣에 포함된 볼록한 곡선) → 좌하단
    `C${cx - 30 * s},${48 * s} ${cx - 28 * s},${58 * s} ${cx - 26 * s},${65 * s}`,
    `C${cx - 24 * s},${72 * s} ${cx - 22 * s},${82 * s} ${cx - 16 * s},${90 * s}`,
    // 좌측 하단 → 중앙 하단 (평평한 바닥)
    `Q${cx - 10 * s},${94 * s} ${cx},${94 * s}`,
    // 중앙 하단 → 우측 하단
    `Q${cx + 10 * s},${94 * s} ${cx + 16 * s},${90 * s}`,
    // 우측 팔(몸 실루엣에 포함) → 우측 어깨
    `C${cx + 22 * s},${82 * s} ${cx + 24 * s},${72 * s} ${cx + 26 * s},${65 * s}`,
    `C${cx + 28 * s},${58 * s} ${cx + 30 * s},${48 * s} ${cx + 28 * s},${40 * s}`,
    // 후드 우측 곡선 → 상단 복귀
    `C${cx + 32 * s},${28 * s} ${cx + 28 * s},${3 * s} ${cx},${3 * s}`,
    "Z",
  ].join(" ");

  return (
    <>
      {/* 메인 바디 실루엣 */}
      <path d={path} fill={color} />
      {/* 좌측 하이라이트 */}
      <ellipse cx={cx - 12 * s} cy={35 * s} rx={10 * s} ry={18 * s} fill={lighter} opacity={0.1} />
      {/* 지퍼 라인 */}
      <line x1={cx} y1={50 * s} x2={cx} y2={90 * s} stroke={darker} strokeWidth={1 * s} strokeLinecap="round" opacity={0.25} />
    </>
  );
}

/* ═══════════════════════════════════════════
   Main Character Component

   레이어 순서 (아래→위):
   1. Shadow
   2. Legs (다리 2개)
   3. Body Silhouette (후드+몸통 일체형 단일 path)
   4. Face (피부색 원)
   5. Hair
   6. Eyes
   7. Accessories
   8. Blush + Mouth
   9. Initial text
   ═══════════════════════════════════════════ */
function Character({ hoodieColor, eyeStyle, hairStyle, initial, size = 120, skinTone = "#fce4c8", frame = "none", accessory = "none" }: CharacterProps) {
  const s = size / 100;
  const cx = 50 * s;
  const darker = darkenColor(hoodieColor, 30);
  const lighter = lightenColor(hoodieColor, 30);
  const skinHighlight = lightenColor(skinTone, 20);

  const headCy = 30 * s;  // 후드 중심 (상단 45% 영역)
  const faceCy = headCy + 5 * s;
  const eyeCy = headCy + 4 * s;

  return (
    <svg width={size} height={size * 1.05} viewBox={`0 0 ${100 * s} ${105 * s}`} fill="none">
      {/* Layer 0: Shadow */}
      <ellipse cx={cx} cy={99 * s} rx={18 * s} ry={2.5 * s} fill="black" opacity={0.1} />

      {/* Layer 1: Legs (다리만 살짝) */}
      <rect x={cx - 10 * s} y={92 * s} width={7 * s} height={6 * s} rx={2.5 * s} fill={darker} />
      <rect x={cx + 3 * s} y={92 * s} width={7 * s} height={6 * s} rx={2.5 * s} fill={darker} />

      {/* Layer 2: Body Silhouette (후드+몸통 일체형 벨 쉐이프) */}
      <BellBody cx={cx} s={s} color={hoodieColor} darker={darker} lighter={lighter} />

      {/* Layer 3: Face (후드 안 피부색 원) */}
      <circle cx={cx} cy={faceCy} r={18 * s} fill={skinTone} />
      <ellipse cx={cx - 5 * s} cy={faceCy - 4 * s} rx={7 * s} ry={9 * s} fill={skinHighlight} opacity={0.3} />

      {/* Layer 4: Hair */}
      <HairBangs style={hairStyle} cx={cx} cy={headCy - 11 * s} s={s} color={hoodieColor} />

      {/* Layer 5: Eyes */}
      <Eyes style={eyeStyle} cx={cx} cy={eyeCy} s={s} />

      {/* Layer 6: Accessories */}
      <Accessory style={accessory} cx={cx} cy={eyeCy} s={s} />

      {/* Layer 7: Blush + Mouth */}
      <ellipse cx={cx - 13 * s} cy={faceCy + 8 * s} rx={3.5 * s} ry={2 * s} fill="#ffb3b3" opacity={0.35} />
      <ellipse cx={cx + 13 * s} cy={faceCy + 8 * s} rx={3.5 * s} ry={2 * s} fill="#ffb3b3" opacity={0.35} />
      <path
        d={`M${cx - 2.5 * s},${faceCy + 11 * s} Q${cx},${faceCy + 14 * s} ${cx + 2.5 * s},${faceCy + 11 * s}`}
        stroke="#c4956a" strokeWidth={0.9 * s} fill="none" strokeLinecap="round"
      />

      {/* Layer 8: Initial */}
      <text
        x={cx}
        y={74 * s}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={10 * s}
        fontWeight="900"
        fontFamily="sans-serif"
        opacity={0.75}
      >
        {initial}
      </text>
    </svg>
  );
}

export default React.memo(Character);
