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

function Eyes({ style, cx, cy, scale }: { style: EyeStyle; cx: number; cy: number; scale: number }) {
  const gap = 6 * scale;
  switch (style) {
    case "dot":
      return (
        <>
          <circle cx={cx - gap} cy={cy} r={1.5 * scale} fill="#1a1a2e" />
          <circle cx={cx + gap} cy={cy} r={1.5 * scale} fill="#1a1a2e" />
        </>
      );
    case "round":
      return (
        <>
          <circle cx={cx - gap} cy={cy} r={2.5 * scale} fill="white" stroke="#1a1a2e" strokeWidth={1 * scale} />
          <circle cx={cx - gap} cy={cy + 0.5 * scale} r={1.2 * scale} fill="#1a1a2e" />
          <circle cx={cx + gap} cy={cy} r={2.5 * scale} fill="white" stroke="#1a1a2e" strokeWidth={1 * scale} />
          <circle cx={cx + gap} cy={cy + 0.5 * scale} r={1.2 * scale} fill="#1a1a2e" />
        </>
      );
    case "happy":
      return (
        <>
          <path
            d={`M${cx - gap - 2.5 * scale},${cy} Q${cx - gap},${cy - 3 * scale} ${cx - gap + 2.5 * scale},${cy}`}
            fill="none" stroke="#1a1a2e" strokeWidth={1.2 * scale} strokeLinecap="round"
          />
          <path
            d={`M${cx + gap - 2.5 * scale},${cy} Q${cx + gap},${cy - 3 * scale} ${cx + gap + 2.5 * scale},${cy}`}
            fill="none" stroke="#1a1a2e" strokeWidth={1.2 * scale} strokeLinecap="round"
          />
        </>
      );
    case "star":
      return (
        <>
          <StarShape cx={cx - gap} cy={cy} r={3 * scale} />
          <StarShape cx={cx + gap} cy={cy} r={3 * scale} />
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

function Hair({ style, cx, cy, scale, color }: { style: HairStyle; cx: number; cy: number; scale: number; color: string }) {
  const darker = darkenColor(color, 30);
  switch (style) {
    case "none":
      return null;
    case "bangs":
      return (
        <path
          d={`M${cx - 11 * scale},${cy - 2 * scale} Q${cx - 8 * scale},${cy - 8 * scale} ${cx},${cy - 7 * scale} Q${cx + 8 * scale},${cy - 8 * scale} ${cx + 11 * scale},${cy - 2 * scale} L${cx + 11 * scale},${cy + 2 * scale} Q${cx + 5 * scale},${cy - 1 * scale} ${cx},${cy} Q${cx - 5 * scale},${cy - 1 * scale} ${cx - 11 * scale},${cy + 2 * scale} Z`}
          fill={darker}
        />
      );
    case "parted":
      return (
        <>
          <path
            d={`M${cx},${cy - 7 * scale} Q${cx - 12 * scale},${cy - 5 * scale} ${cx - 12 * scale},${cy + 1 * scale} L${cx - 10 * scale},${cy + 1 * scale} Q${cx - 9 * scale},${cy - 3 * scale} ${cx},${cy - 4 * scale} Z`}
            fill={darker}
          />
          <path
            d={`M${cx},${cy - 7 * scale} Q${cx + 12 * scale},${cy - 5 * scale} ${cx + 12 * scale},${cy + 1 * scale} L${cx + 10 * scale},${cy + 1 * scale} Q${cx + 9 * scale},${cy - 3 * scale} ${cx},${cy - 4 * scale} Z`}
            fill={darker}
          />
        </>
      );
    case "curly":
      return (
        <>
          <circle cx={cx - 9 * scale} cy={cy - 3 * scale} r={4 * scale} fill={darker} />
          <circle cx={cx - 4 * scale} cy={cy - 6 * scale} r={4 * scale} fill={darker} />
          <circle cx={cx + 4 * scale} cy={cy - 6 * scale} r={4 * scale} fill={darker} />
          <circle cx={cx + 9 * scale} cy={cy - 3 * scale} r={4 * scale} fill={darker} />
          <circle cx={cx} cy={cy - 7 * scale} r={3 * scale} fill={darker} />
        </>
      );
  }
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}

export default function Character({ hoodieColor, eyeStyle, hairStyle, initial, size = 120 }: CharacterProps) {
  const s = size / 120; // scale factor based on 120px base
  const cx = 60 * s;

  return (
    <svg width={size} height={size * 1.25} viewBox={`0 0 ${120 * s} ${150 * s}`} fill="none">
      {/* Feet */}
      <rect x={42 * s} y={135 * s} width={10 * s} height={8 * s} rx={2 * s} fill="#1a1a2e" />
      <rect x={68 * s} y={135 * s} width={10 * s} height={8 * s} rx={2 * s} fill="#1a1a2e" />

      {/* Body (hoodie bottom) */}
      <rect x={30 * s} y={85 * s} width={60 * s} height={55 * s} rx={10 * s} fill={hoodieColor} />

      {/* Hood */}
      <ellipse cx={cx} cy={45 * s} rx={32 * s} ry={35 * s} fill={hoodieColor} />

      {/* Hood inner shadow */}
      <ellipse cx={cx} cy={47 * s} rx={26 * s} ry={28 * s} fill={darkenColor(hoodieColor, 20)} opacity={0.3} />

      {/* Face */}
      <ellipse cx={cx} cy={52 * s} rx={20 * s} ry={22 * s} fill="#fce4c8" />

      {/* Hair */}
      <Hair style={hairStyle} cx={cx} cy={38 * s} scale={s} color={hoodieColor} />

      {/* Eyes */}
      <Eyes style={eyeStyle} cx={cx} cy={50 * s} scale={s} />

      {/* Mouth */}
      <path
        d={`M${cx - 4 * s},${60 * s} Q${cx},${62 * s} ${cx + 4 * s},${60 * s}`}
        stroke="#c4956a" strokeWidth={1 * s} fill="none" strokeLinecap="round"
      />

      {/* Hood string */}
      <line x1={50 * s} y1={75 * s} x2={50 * s} y2={85 * s} stroke={darkenColor(hoodieColor, 40)} strokeWidth={1.5 * s} />
      <line x1={70 * s} y1={75 * s} x2={70 * s} y2={85 * s} stroke={darkenColor(hoodieColor, 40)} strokeWidth={1.5 * s} />

      {/* Initial on hoodie — extra large */}
      <text
        x={cx}
        y={112 * s}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={30 * s}
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing={-1 * s}
      >
        {initial}
      </text>
    </svg>
  );
}
