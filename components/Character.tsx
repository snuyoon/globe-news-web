"use client";

export type EyeStyle = "dot" | "round" | "happy" | "star";
export type HairStyle = "bangs" | "parted" | "none" | "curly";

export interface CharacterProps {
  hoodieColor: string;
  eyeStyle: EyeStyle;
  hairStyle: HairStyle;
  initial: string;
  size?: number;
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
  const gap = 5 * s;
  switch (style) {
    case "dot":
      return (
        <>
          <ellipse cx={cx - gap} cy={cy} rx={2.2 * s} ry={2.5 * s} fill="#1a1a2e" />
          <ellipse cx={cx + gap} cy={cy} rx={2.2 * s} ry={2.5 * s} fill="#1a1a2e" />
        </>
      );
    case "round":
      return (
        <>
          <ellipse cx={cx - gap} cy={cy} rx={3 * s} ry={3.5 * s} fill="white" stroke="#1a1a2e" strokeWidth={0.8 * s} />
          <ellipse cx={cx - gap + 0.5 * s} cy={cy + 0.5 * s} rx={1.5 * s} ry={2 * s} fill="#1a1a2e" />
          <circle cx={cx - gap + 1 * s} cy={cy - 1 * s} r={0.8 * s} fill="white" />
          <ellipse cx={cx + gap} cy={cy} rx={3 * s} ry={3.5 * s} fill="white" stroke="#1a1a2e" strokeWidth={0.8 * s} />
          <ellipse cx={cx + gap + 0.5 * s} cy={cy + 0.5 * s} rx={1.5 * s} ry={2 * s} fill="#1a1a2e" />
          <circle cx={cx + gap + 1 * s} cy={cy - 1 * s} r={0.8 * s} fill="white" />
        </>
      );
    case "happy":
      return (
        <>
          <path
            d={`M${cx - gap - 2.5 * s},${cy} Q${cx - gap},${cy - 3 * s} ${cx - gap + 2.5 * s},${cy}`}
            fill="none" stroke="#1a1a2e" strokeWidth={1.5 * s} strokeLinecap="round"
          />
          <path
            d={`M${cx + gap - 2.5 * s},${cy} Q${cx + gap},${cy - 3 * s} ${cx + gap + 2.5 * s},${cy}`}
            fill="none" stroke="#1a1a2e" strokeWidth={1.5 * s} strokeLinecap="round"
          />
        </>
      );
    case "star":
      return (
        <>
          <StarShape cx={cx - gap} cy={cy} r={3 * s} />
          <StarShape cx={cx + gap} cy={cy} r={3 * s} />
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
      // 이미지처럼 이마에 삐쭉 나온 앞머리
      return (
        <g fill={dark}>
          <path d={`M${cx - 4 * s},${cy} L${cx - 5 * s},${cy - 6 * s} L${cx - 2 * s},${cy - 1 * s} L${cx - 1 * s},${cy - 7 * s} L${cx + 1 * s},${cy - 1 * s} L${cx + 2 * s},${cy - 6 * s} L${cx + 4 * s},${cy} Z`} />
        </g>
      );
    case "parted":
      return (
        <g fill={dark}>
          <path d={`M${cx - 7 * s},${cy} L${cx - 6 * s},${cy - 5 * s} L${cx - 2 * s},${cy - 1 * s} L${cx},${cy - 3 * s} L${cx},${cy} Z`} />
          <path d={`M${cx + 7 * s},${cy} L${cx + 6 * s},${cy - 5 * s} L${cx + 2 * s},${cy - 1 * s} L${cx},${cy - 3 * s} L${cx},${cy} Z`} />
        </g>
      );
    case "curly":
      return (
        <g fill={dark}>
          <circle cx={cx - 5 * s} cy={cy - 3 * s} r={3 * s} />
          <circle cx={cx} cy={cy - 4 * s} r={3 * s} />
          <circle cx={cx + 5 * s} cy={cy - 3 * s} r={3 * s} />
        </g>
      );
  }
}

export default function Character({ hoodieColor, eyeStyle, hairStyle, initial, size = 120 }: CharacterProps) {
  const s = size / 100;
  const cx = 50 * s;
  const darker = darkenColor(hoodieColor, 30);
  const lighter = lightenColor(hoodieColor, 30);

  return (
    <svg width={size} height={size * 1.15} viewBox={`0 0 ${100 * s} ${115 * s}`} fill="none">
      {/* Shadow */}
      <ellipse cx={cx} cy={110 * s} rx={20 * s} ry={3 * s} fill="black" opacity={0.15} />

      {/* Feet */}
      <rect x={35 * s} y={96 * s} width={10 * s} height={10 * s} rx={3 * s} fill={darker} />
      <rect x={55 * s} y={96 * s} width={10 * s} height={10 * s} rx={3 * s} fill={darker} />

      {/* Body — round puffy hoodie */}
      <ellipse cx={cx} cy={78 * s} rx={24 * s} ry={26 * s} fill={hoodieColor} />
      {/* Body highlight */}
      <ellipse cx={cx - 8 * s} cy={72 * s} rx={8 * s} ry={14 * s} fill={lighter} opacity={0.12} />

      {/* Zipper line */}
      <line x1={cx} y1={60 * s} x2={cx} y2={100 * s} stroke={darker} strokeWidth={1.5 * s} strokeLinecap="round" />

      {/* Arms — small bumps on sides */}
      <ellipse cx={26 * s} cy={76 * s} rx={6 * s} ry={10 * s} fill={hoodieColor} />
      <ellipse cx={74 * s} cy={76 * s} rx={6 * s} ry={10 * s} fill={hoodieColor} />

      {/* Hood — big round */}
      <ellipse cx={cx} cy={34 * s} rx={28 * s} ry={28 * s} fill={hoodieColor} />
      {/* Hood highlight */}
      <ellipse cx={cx - 10 * s} cy={24 * s} rx={10 * s} ry={14 * s} fill={lighter} opacity={0.15} />

      {/* Hood opening — face area (darker inner shadow) */}
      <ellipse cx={cx} cy={38 * s} rx={17 * s} ry={18 * s} fill={darker} opacity={0.2} />

      {/* Face — white/cream round */}
      <ellipse cx={cx} cy={40 * s} rx={14 * s} ry={14 * s} fill="#fce4c8" />

      {/* Hair bangs inside hood */}
      <HairBangs style={hairStyle} cx={cx} cy={30 * s} s={s} color={hoodieColor} />

      {/* Eyes */}
      <Eyes style={eyeStyle} cx={cx} cy={40 * s} s={s} />

      {/* Mouth — tiny smile */}
      <path
        d={`M${cx - 2.5 * s},${46 * s} Q${cx},${48.5 * s} ${cx + 2.5 * s},${46 * s}`}
        stroke="#c4956a" strokeWidth={1 * s} fill="none" strokeLinecap="round"
      />

      {/* Blush */}
      <ellipse cx={cx - 10 * s} cy={43 * s} rx={3 * s} ry={1.8 * s} fill="#ffb3b3" opacity={0.3} />
      <ellipse cx={cx + 10 * s} cy={43 * s} rx={3 * s} ry={1.8 * s} fill="#ffb3b3" opacity={0.3} />

      {/* Initial on hoodie body */}
      <text
        x={cx}
        y={82 * s}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={16 * s}
        fontWeight="900"
        fontFamily="sans-serif"
        opacity={0.85}
      >
        {initial}
      </text>
    </svg>
  );
}
