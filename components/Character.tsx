"use client";

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

function Eyes({ style, cx, cy, s }: { style: EyeStyle; cx: number; cy: number; s: number }) {
  const gap = 8 * s;
  switch (style) {
    case "dot":
      return (
        <>
          <ellipse cx={cx - gap} cy={cy} rx={3.5 * s} ry={4 * s} fill="#1a1a2e" />
          <ellipse cx={cx + gap} cy={cy} rx={3.5 * s} ry={4 * s} fill="#1a1a2e" />
          <circle cx={cx - gap + 1.2 * s} cy={cy - 1.5 * s} r={1.3 * s} fill="white" opacity={0.9} />
          <circle cx={cx + gap + 1.2 * s} cy={cy - 1.5 * s} r={1.3 * s} fill="white" opacity={0.9} />
        </>
      );
    case "round":
      return (
        <>
          <ellipse cx={cx - gap} cy={cy} rx={5 * s} ry={5.5 * s} fill="white" stroke="#1a1a2e" strokeWidth={0.8 * s} />
          <ellipse cx={cx - gap + 1 * s} cy={cy + 0.5 * s} rx={3 * s} ry={3.5 * s} fill="#1a1a2e" />
          <circle cx={cx - gap + 2 * s} cy={cy - 1.5 * s} r={1.5 * s} fill="white" opacity={0.9} />
          <ellipse cx={cx + gap} cy={cy} rx={5 * s} ry={5.5 * s} fill="white" stroke="#1a1a2e" strokeWidth={0.8 * s} />
          <ellipse cx={cx + gap + 1 * s} cy={cy + 0.5 * s} rx={3 * s} ry={3.5 * s} fill="#1a1a2e" />
          <circle cx={cx + gap + 2 * s} cy={cy - 1.5 * s} r={1.5 * s} fill="white" opacity={0.9} />
        </>
      );
    case "happy":
      return (
        <>
          <path
            d={`M${cx - gap - 4 * s},${cy + 1 * s} Q${cx - gap},${cy - 5 * s} ${cx - gap + 4 * s},${cy + 1 * s}`}
            fill="none" stroke="#1a1a2e" strokeWidth={2 * s} strokeLinecap="round"
          />
          <path
            d={`M${cx + gap - 4 * s},${cy + 1 * s} Q${cx + gap},${cy - 5 * s} ${cx + gap + 4 * s},${cy + 1 * s}`}
            fill="none" stroke="#1a1a2e" strokeWidth={2 * s} strokeLinecap="round"
          />
        </>
      );
    case "star":
      return (
        <>
          <StarShape cx={cx - gap} cy={cy} r={5 * s} />
          <StarShape cx={cx + gap} cy={cy} r={5 * s} />
          <circle cx={cx - gap + 1.5 * s} cy={cy - 2 * s} r={1.2 * s} fill="white" opacity={0.8} />
          <circle cx={cx + gap + 1.5 * s} cy={cy - 2 * s} r={1.2 * s} fill="white" opacity={0.8} />
        </>
      );
    case "wink":
      return (
        <>
          <ellipse cx={cx - gap} cy={cy} rx={3.5 * s} ry={4 * s} fill="#1a1a2e" />
          <circle cx={cx - gap + 1.2 * s} cy={cy - 1.5 * s} r={1.3 * s} fill="white" opacity={0.9} />
          <path
            d={`M${cx + gap - 4 * s},${cy} Q${cx + gap},${cy - 4 * s} ${cx + gap + 4 * s},${cy}`}
            fill="none" stroke="#1a1a2e" strokeWidth={2 * s} strokeLinecap="round"
          />
        </>
      );
    case "sparkle":
      return (
        <>
          <ellipse cx={cx - gap} cy={cy} rx={5 * s} ry={5.5 * s} fill="#1a1a2e" />
          <circle cx={cx - gap - 0.5 * s} cy={cy - 1 * s} r={2.5 * s} fill="white" opacity={0.9} />
          <circle cx={cx - gap + 2 * s} cy={cy + 1.5 * s} r={1 * s} fill="white" opacity={0.7} />
          <ellipse cx={cx + gap} cy={cy} rx={5 * s} ry={5.5 * s} fill="#1a1a2e" />
          <circle cx={cx + gap - 0.5 * s} cy={cy - 1 * s} r={2.5 * s} fill="white" opacity={0.9} />
          <circle cx={cx + gap + 2 * s} cy={cy + 1.5 * s} r={1 * s} fill="white" opacity={0.7} />
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

function HairBangs({ style, cx, cy, s, color }: { style: HairStyle; cx: number; cy: number; s: number; color: string }) {
  const dark = darkenColor(color, 50);
  switch (style) {
    case "none":
      return null;
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

function Accessory({ style, cx, cy, s }: { style: AccessoryStyle; cx: number; cy: number; s: number }) {
  const gap = 8 * s;
  switch (style) {
    case "none": return null;
    case "sunglasses":
      return (
        <g>
          <rect x={cx - gap - 6 * s} y={cy - 4 * s} width={12 * s} height={8 * s} rx={3 * s} fill="#1a1a2e" opacity={0.85} />
          <rect x={cx + gap - 6 * s} y={cy - 4 * s} width={12 * s} height={8 * s} rx={3 * s} fill="#1a1a2e" opacity={0.85} />
          <line x1={cx - gap + 6 * s} y1={cy} x2={cx + gap - 6 * s} y2={cy} stroke="#1a1a2e" strokeWidth={1.5 * s} />
          <line x1={cx - gap - 6 * s} y1={cy - 1 * s} x2={cx - gap - 9 * s} y2={cy - 3 * s} stroke="#1a1a2e" strokeWidth={1.5 * s} strokeLinecap="round" />
          <line x1={cx + gap + 6 * s} y1={cy - 1 * s} x2={cx + gap + 9 * s} y2={cy - 3 * s} stroke="#1a1a2e" strokeWidth={1.5 * s} strokeLinecap="round" />
          {/* lens shine */}
          <rect x={cx - gap - 3 * s} y={cy - 3 * s} width={3 * s} height={1.5 * s} rx={0.5 * s} fill="white" opacity={0.3} />
          <rect x={cx + gap - 3 * s} y={cy - 3 * s} width={3 * s} height={1.5 * s} rx={0.5 * s} fill="white" opacity={0.3} />
        </g>
      );
    case "glasses":
      return (
        <g>
          <circle cx={cx - gap} cy={cy} r={6.5 * s} fill="none" stroke="#8b7355" strokeWidth={1.2 * s} />
          <circle cx={cx + gap} cy={cy} r={6.5 * s} fill="none" stroke="#8b7355" strokeWidth={1.2 * s} />
          <line x1={cx - gap + 6.5 * s} y1={cy} x2={cx + gap - 6.5 * s} y2={cy} stroke="#8b7355" strokeWidth={1 * s} />
          <line x1={cx - gap - 6.5 * s} y1={cy - 1 * s} x2={cx - gap - 9 * s} y2={cy - 3 * s} stroke="#8b7355" strokeWidth={1 * s} strokeLinecap="round" />
          <line x1={cx + gap + 6.5 * s} y1={cy - 1 * s} x2={cx + gap + 9 * s} y2={cy - 3 * s} stroke="#8b7355" strokeWidth={1 * s} strokeLinecap="round" />
        </g>
      );
    case "aviator":
      return (
        <g>
          <ellipse cx={cx - gap} cy={cy + 1 * s} rx={7 * s} ry={6 * s} fill="#1a1a2e" opacity={0.75} />
          <ellipse cx={cx + gap} cy={cy + 1 * s} rx={7 * s} ry={6 * s} fill="#1a1a2e" opacity={0.75} />
          <line x1={cx - gap + 7 * s} y1={cy - 1 * s} x2={cx + gap - 7 * s} y2={cy - 1 * s} stroke="#f0b90b" strokeWidth={1.2 * s} />
          <line x1={cx - gap - 7 * s} y1={cy - 2 * s} x2={cx - gap - 10 * s} y2={cy - 4 * s} stroke="#f0b90b" strokeWidth={1.2 * s} strokeLinecap="round" />
          <line x1={cx + gap + 7 * s} y1={cy - 2 * s} x2={cx + gap + 10 * s} y2={cy - 4 * s} stroke="#f0b90b" strokeWidth={1.2 * s} strokeLinecap="round" />
          <ellipse cx={cx - gap - 1 * s} cy={cy - 1 * s} rx={2 * s} ry={1 * s} fill="white" opacity={0.2} />
          <ellipse cx={cx + gap - 1 * s} cy={cy - 1 * s} rx={2 * s} ry={1 * s} fill="white" opacity={0.2} />
        </g>
      );
    case "monocle":
      return (
        <g>
          <circle cx={cx + gap} cy={cy} r={7 * s} fill="none" stroke="#f0b90b" strokeWidth={1.2 * s} />
          <line x1={cx + gap} y1={cy + 7 * s} x2={cx + gap - 2 * s} y2={cy + 14 * s} stroke="#f0b90b" strokeWidth={0.8 * s} strokeLinecap="round" />
        </g>
      );
  }
}

function Frame({ style, cx, cy, r, s }: { style: FrameStyle; cx: number; cy: number; r: number; s: number }) {
  switch (style) {
    case "none": return null;
    case "gold":
      return (
        <circle cx={cx} cy={cy} r={r + 4 * s} fill="none" stroke="#f0b90b" strokeWidth={2.5 * s} opacity={0.8} />
      );
    case "diamond":
      return (
        <>
          <circle cx={cx} cy={cy} r={r + 4 * s} fill="none" stroke="#c0c0c0" strokeWidth={2 * s} opacity={0.6} />
          <circle cx={cx} cy={cy} r={r + 4 * s} fill="none" stroke="white" strokeWidth={0.5 * s} opacity={0.3} strokeDasharray={`${3 * s} ${5 * s}`} />
        </>
      );
    case "flame":
      return (
        <circle cx={cx} cy={cy} r={r + 4 * s} fill="none" stroke="#ef6d09" strokeWidth={2.5 * s} opacity={0.7} />
      );
  }
}

export default function Character({ hoodieColor, eyeStyle, hairStyle, initial, size = 120, skinTone = "#fce4c8", frame = "none", accessory = "none" }: CharacterProps) {
  const s = size / 100;
  const cx = 50 * s;
  const darker = darkenColor(hoodieColor, 30);
  const lighter = lightenColor(hoodieColor, 30);
  const skinHighlight = lightenColor(skinTone, 20);

  const headCy = 36 * s;
  const headR = 33 * s;
  const bodyCy = 82 * s;

  return (
    <svg width={size} height={size * 1.05} viewBox={`0 0 ${100 * s} ${105 * s}`} fill="none">
      {/* Shadow */}
      <ellipse cx={cx} cy={100 * s} rx={14 * s} ry={2 * s} fill="black" opacity={0.12} />

      {/* Tiny round feet */}
      <circle cx={40 * s} cy={96 * s} r={4.5 * s} fill={darker} />
      <circle cx={60 * s} cy={96 * s} r={4.5 * s} fill={darker} />

      {/* Small round body */}
      <ellipse cx={cx} cy={bodyCy} rx={14 * s} ry={14 * s} fill={hoodieColor} />

      {/* Body highlight */}
      <ellipse cx={cx - 4 * s} cy={bodyCy - 5 * s} rx={5 * s} ry={7 * s} fill={lighter} opacity={0.12} />

      {/* Tiny round arms */}
      <circle cx={34 * s} cy={80 * s} r={5 * s} fill={hoodieColor} />
      <circle cx={66 * s} cy={80 * s} r={5 * s} fill={hoodieColor} />

      {/* === BIG HEAD (hood) === */}
      <circle cx={cx} cy={headCy} r={headR} fill={hoodieColor} />
      {/* Hood highlight */}
      <ellipse cx={cx - 12 * s} cy={headCy - 14 * s} rx={14 * s} ry={12 * s} fill={lighter} opacity={0.15} />

      {/* Hood inner shadow */}
      <ellipse cx={cx} cy={headCy + 4 * s} rx={23 * s} ry={23 * s} fill={darker} opacity={0.12} />

      {/* Face */}
      <circle cx={cx} cy={headCy + 5 * s} r={20 * s} fill={skinTone} />
      {/* Face highlight */}
      <ellipse cx={cx - 6 * s} cy={headCy} rx={9 * s} ry={11 * s} fill={skinHighlight} opacity={0.4} />

      {/* Hair */}
      <HairBangs style={hairStyle} cx={cx} cy={headCy - 13 * s} s={s} color={hoodieColor} />

      {/* Eyes */}
      <Eyes style={eyeStyle} cx={cx} cy={headCy + 4 * s} s={s} />

      {/* Accessory (over eyes) */}
      <Accessory style={accessory} cx={cx} cy={headCy + 4 * s} s={s} />

      {/* Blush */}
      <ellipse cx={cx - 15 * s} cy={headCy + 12 * s} rx={4.5 * s} ry={2.5 * s} fill="#ffb3b3" opacity={0.4} />
      <ellipse cx={cx + 15 * s} cy={headCy + 12 * s} rx={4.5 * s} ry={2.5 * s} fill="#ffb3b3" opacity={0.4} />

      {/* Mouth — cute smile */}
      <path
        d={`M${cx - 3.5 * s},${headCy + 15 * s} Q${cx},${headCy + 19 * s} ${cx + 3.5 * s},${headCy + 15 * s}`}
        stroke="#c4956a" strokeWidth={1.2 * s} fill="none" strokeLinecap="round"
      />

      {/* Initial on body */}
      <text
        x={cx}
        y={bodyCy + 1 * s}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={12 * s}
        fontWeight="900"
        fontFamily="sans-serif"
        opacity={0.85}
      >
        {initial}
      </text>
    </svg>
  );
}
