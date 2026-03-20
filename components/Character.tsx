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
  const gap = 7 * s;
  switch (style) {
    case "dot":
      return (
        <>
          <ellipse cx={cx - gap} cy={cy} rx={2.5 * s} ry={3 * s} fill="#2a2a3e" />
          <ellipse cx={cx + gap} cy={cy} rx={2.5 * s} ry={3 * s} fill="#2a2a3e" />
          {/* highlights */}
          <circle cx={cx - gap + 1 * s} cy={cy - 1.5 * s} r={1 * s} fill="white" opacity={0.8} />
          <circle cx={cx + gap + 1 * s} cy={cy - 1.5 * s} r={1 * s} fill="white" opacity={0.8} />
        </>
      );
    case "round":
      return (
        <>
          <ellipse cx={cx - gap} cy={cy} rx={4 * s} ry={4.5 * s} fill="white" />
          <ellipse cx={cx + gap} cy={cy} rx={4 * s} ry={4.5 * s} fill="white" />
          <ellipse cx={cx - gap + 0.5 * s} cy={cy + 0.5 * s} rx={2.5 * s} ry={3 * s} fill="#2a2a3e" />
          <ellipse cx={cx + gap + 0.5 * s} cy={cy + 0.5 * s} rx={2.5 * s} ry={3 * s} fill="#2a2a3e" />
          <circle cx={cx - gap + 1.5 * s} cy={cy - 1 * s} r={1.2 * s} fill="white" opacity={0.9} />
          <circle cx={cx + gap + 1.5 * s} cy={cy - 1 * s} r={1.2 * s} fill="white" opacity={0.9} />
        </>
      );
    case "happy":
      return (
        <>
          <path
            d={`M${cx - gap - 3.5 * s},${cy + 0.5 * s} Q${cx - gap},${cy - 4 * s} ${cx - gap + 3.5 * s},${cy + 0.5 * s}`}
            fill="none" stroke="#2a2a3e" strokeWidth={2 * s} strokeLinecap="round"
          />
          <path
            d={`M${cx + gap - 3.5 * s},${cy + 0.5 * s} Q${cx + gap},${cy - 4 * s} ${cx + gap + 3.5 * s},${cy + 0.5 * s}`}
            fill="none" stroke="#2a2a3e" strokeWidth={2 * s} strokeLinecap="round"
          />
        </>
      );
    case "star":
      return (
        <>
          <StarShape cx={cx - gap} cy={cy} r={4 * s} />
          <StarShape cx={cx + gap} cy={cy} r={4 * s} />
          <circle cx={cx - gap + 1 * s} cy={cy - 1.5 * s} r={1 * s} fill="white" opacity={0.7} />
          <circle cx={cx + gap + 1 * s} cy={cy - 1.5 * s} r={1 * s} fill="white" opacity={0.7} />
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
  return <polygon points={points.join(" ")} fill="#2a2a3e" />;
}

function Hair({ style, cx, top, s, color }: { style: HairStyle; cx: number; top: number; s: number; color: string }) {
  const darker = darkenColor(color, 40);
  switch (style) {
    case "none":
      return null;
    case "bangs":
      return (
        <path
          d={`M${cx - 16 * s},${top + 10 * s}
              Q${cx - 12 * s},${top - 2 * s} ${cx},${top - 3 * s}
              Q${cx + 12 * s},${top - 2 * s} ${cx + 16 * s},${top + 10 * s}
              L${cx + 14 * s},${top + 14 * s}
              Q${cx + 6 * s},${top + 6 * s} ${cx},${top + 7 * s}
              Q${cx - 6 * s},${top + 6 * s} ${cx - 14 * s},${top + 14 * s} Z`}
          fill={darker}
        />
      );
    case "parted":
      return (
        <>
          <path
            d={`M${cx},${top - 2 * s} Q${cx - 18 * s},${top} ${cx - 17 * s},${top + 14 * s} L${cx - 14 * s},${top + 12 * s} Q${cx - 13 * s},${top + 4 * s} ${cx},${top + 2 * s} Z`}
            fill={darker}
          />
          <path
            d={`M${cx},${top - 2 * s} Q${cx + 18 * s},${top} ${cx + 17 * s},${top + 14 * s} L${cx + 14 * s},${top + 12 * s} Q${cx + 13 * s},${top + 4 * s} ${cx},${top + 2 * s} Z`}
            fill={darker}
          />
        </>
      );
    case "curly":
      return (
        <>
          <circle cx={cx - 12 * s} cy={top + 5 * s} r={5 * s} fill={darker} />
          <circle cx={cx - 5 * s} cy={top - 1 * s} r={5.5 * s} fill={darker} />
          <circle cx={cx + 5 * s} cy={top - 1 * s} r={5.5 * s} fill={darker} />
          <circle cx={cx + 12 * s} cy={top + 5 * s} r={5 * s} fill={darker} />
          <circle cx={cx} cy={top - 3 * s} r={4 * s} fill={darker} />
        </>
      );
  }
}

export default function Character({ hoodieColor, eyeStyle, hairStyle, initial, size = 120 }: CharacterProps) {
  const s = size / 100;
  const cx = 50 * s;
  const headCy = 35 * s;
  const headRx = 22 * s;
  const headRy = 24 * s;

  return (
    <svg width={size} height={size * 1.2} viewBox={`0 0 ${100 * s} ${120 * s}`} fill="none">
      {/* Body */}
      <rect x={28 * s} y={62 * s} width={44 * s} height={38 * s} rx={12 * s} fill={hoodieColor} />
      {/* Body highlight */}
      <rect x={32 * s} y={64 * s} width={16 * s} height={20 * s} rx={8 * s} fill={lightenColor(hoodieColor, 20)} opacity={0.15} />

      {/* Arms */}
      <ellipse cx={24 * s} cy={78 * s} rx={6 * s} ry={12 * s} fill={hoodieColor} />
      <ellipse cx={76 * s} cy={78 * s} rx={6 * s} ry={12 * s} fill={hoodieColor} />

      {/* Feet */}
      <ellipse cx={38 * s} cy={100 * s} rx={8 * s} ry={5 * s} fill="#2a2a3e" />
      <ellipse cx={62 * s} cy={100 * s} rx={8 * s} ry={5 * s} fill="#2a2a3e" />

      {/* Head - big round */}
      <ellipse cx={cx} cy={headCy} rx={headRx} ry={headRy} fill="#fce4c8" />
      {/* Face highlight */}
      <ellipse cx={cx - 5 * s} cy={headCy - 6 * s} rx={12 * s} ry={10 * s} fill="#fdebd3" opacity={0.5} />

      {/* Ears */}
      <ellipse cx={cx - headRx + 2 * s} cy={headCy + 2 * s} rx={3 * s} ry={4 * s} fill="#f5d4a8" />
      <ellipse cx={cx + headRx - 2 * s} cy={headCy + 2 * s} rx={3 * s} ry={4 * s} fill="#f5d4a8" />

      {/* Hair */}
      <Hair style={hairStyle} cx={cx} top={headCy - headRy + 6 * s} s={s} color={hoodieColor} />

      {/* Eyes */}
      <Eyes style={eyeStyle} cx={cx} cy={headCy + 2 * s} s={s} />

      {/* Blush cheeks */}
      <ellipse cx={cx - 13 * s} cy={headCy + 8 * s} rx={4 * s} ry={2.5 * s} fill="#ffb3b3" opacity={0.4} />
      <ellipse cx={cx + 13 * s} cy={headCy + 8 * s} rx={4 * s} ry={2.5 * s} fill="#ffb3b3" opacity={0.4} />

      {/* Mouth - small cute smile */}
      <path
        d={`M${cx - 3 * s},${headCy + 12 * s} Q${cx},${headCy + 15 * s} ${cx + 3 * s},${headCy + 12 * s}`}
        stroke="#c4956a" strokeWidth={1.2 * s} fill="none" strokeLinecap="round"
      />

      {/* Initial on hoodie */}
      <text
        x={cx}
        y={84 * s}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={18 * s}
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing={-0.5 * s}
        opacity={0.9}
      >
        {initial}
      </text>
    </svg>
  );
}
