"use client";

import { Fragment } from "react";

/* ─── sample.json TypeScript interfaces ─── */
interface SampleMeta {
  date: string;
  day: string;
  handle: string;
  total_slides: number;
}

interface CoverData {
  headline: string;
  tickers: string[];
}

interface Indicator {
  num: string;
  label: string;
  time: string;
  values: string;
}

interface EarningsItem {
  symbol: string;
  name: string;
  quarter: string;
  color: string;
  status: string;
  eps: string;
  why: string;
}

interface EarningsBlock {
  subtitle: string;
  items: EarningsItem[];
}

interface QnA {
  q: string;
  a: string;
}

interface FlowStep {
  title: string;
  detail: string;
  color: string;
}

interface Impact {
  bullish: string[];
  bearish: string[];
}

interface HistoryItem {
  year?: string;
  title?: string;
  detail?: string;
}

interface Explainer {
  badge: string;
  title: string;
  qna: QnA[];
  flow?: FlowStep[];
  impact?: Impact;
  history?: HistoryItem[];
}

interface Checkpoint {
  num: string;
  title: string;
  desc: string;
}

export interface SampleJSON {
  _schema_version: string;
  meta: SampleMeta;
  cover: CoverData;
  indicators: Indicator[];
  earnings_pre: EarningsBlock;
  earnings_post: EarningsBlock;
  explainers: Explainer[];
  checkpoints: Checkpoint[];
}

/* ─── Custom markup parser ─── */
function renderMarkup(text: string): React.ReactNode[] {
  // Parse custom tags: <strong>, <green>, <red>, <yellow>, <em-yellow>
  const regex = /<(strong|green|red|yellow|em-yellow)>(.*?)<\/\1>/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const tag = match[1];
    const content = match[2];

    switch (tag) {
      case "strong":
        parts.push(<strong key={key++} className="font-bold text-white">{content}</strong>);
        break;
      case "green":
        parts.push(<span key={key++} className="text-[#22c55e] font-semibold">{content}</span>);
        break;
      case "red":
        parts.push(<span key={key++} className="text-[#ef4444] font-semibold">{content}</span>);
        break;
      case "yellow":
        parts.push(<span key={key++} className="text-[#f0b90b] font-semibold">{content}</span>);
        break;
      case "em-yellow":
        parts.push(<span key={key++} className="text-[#f0b90b] font-bold text-lg">{content}</span>);
        break;
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

/* Render multiline text with markup */
function RichText({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split("\n");
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {renderMarkup(line)}
          {i < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </span>
  );
}

/* ─── Color map for flow timeline ─── */
const FLOW_COLORS: Record<string, string> = {
  yellow: "#f0b90b",
  purple: "#8b5cf6",
  red: "#ef4444",
  pink: "#ec4899",
  green: "#22c55e",
  blue: "#3b82f6",
};

/* ─── Earnings color map ─── */
const EARNINGS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  purple: { bg: "bg-[#8b5cf6]/10", border: "border-[#8b5cf6]/30", text: "text-[#8b5cf6]" },
  green: { bg: "bg-[#22c55e]/10", border: "border-[#22c55e]/30", text: "text-[#22c55e]" },
  red: { bg: "bg-[#ef4444]/10", border: "border-[#ef4444]/30", text: "text-[#ef4444]" },
  yellow: { bg: "bg-[#f0b90b]/10", border: "border-[#f0b90b]/30", text: "text-[#f0b90b]" },
  blue: { bg: "bg-[#3b82f6]/10", border: "border-[#3b82f6]/30", text: "text-[#3b82f6]" },
};

/* ─── Main component ─── */
export default function CardNewsArticle({
  data,
  type,
  onBack,
}: {
  data: SampleJSON;
  type: "premarket" | "morning" | "weekend";
  onBack: () => void;
}) {
  const { meta, cover, indicators, earnings_pre, earnings_post, explainers, checkpoints } = data;

  const typeLabel = type === "premarket" ? "장전 브리핑" : type === "morning" ? "모닝 브리핑" : "주말 특별판";
  const typeColor = type === "premarket" ? "#8b5cf6" : type === "morning" ? "#f0b90b" : "#22c55e";

  return (
    <div className="min-h-screen pb-16">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            목록
          </button>
          <div className="flex-1" />
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ backgroundColor: `${typeColor}15`, color: typeColor }}
          >
            {typeLabel}
          </span>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4">
        {/* ═══════ COVER / HERO ═══════ */}
        <header className="pt-10 pb-8 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-[var(--text-muted)]">{meta.date}</span>
            <span className="text-xs text-[var(--text-muted)]">({meta.day})</span>
            <span className="text-xs text-[var(--text-muted)]">{meta.handle}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight mb-4">
            <RichText text={cover.headline} />
          </h1>
          {cover.tickers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {cover.tickers.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-[#f0b90b]/10 text-[#f0b90b] text-sm font-mono font-bold"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* ═══════ INDICATORS ═══════ */}
        {indicators.length > 0 && (
          <section className="py-8 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center text-base">
                {"📈"}
              </span>
              주요 지표
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {indicators.map((ind) => (
                <div
                  key={ind.num}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--text-muted)] font-mono">#{ind.num}</span>
                    <span className="text-xs text-[var(--text-muted)]">{ind.time}</span>
                  </div>
                  <p className="text-sm font-semibold">{ind.label}</p>
                  {ind.values && (
                    <p className="text-sm text-[var(--text-muted)] mt-1">{ind.values}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════ EARNINGS PRE ═══════ */}
        {earnings_pre.items.length > 0 && (
          <section className="py-8 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center text-base">
                {"📊"}
              </span>
              장전 실적발표
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-5">{earnings_pre.subtitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {earnings_pre.items.map((item) => {
                const colors = EARNINGS_COLORS[item.color] || EARNINGS_COLORS.purple;
                return (
                  <div
                    key={item.symbol}
                    className={`${colors.bg} border ${colors.border} rounded-xl p-4`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-mono font-bold text-sm ${colors.text}`}>{item.symbol}</span>
                      {item.quarter && (
                        <span className="text-xs text-[var(--text-muted)]">{item.quarter}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold mb-2">{item.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mb-2 font-mono">{item.eps}</p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.why}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════ EARNINGS POST ═══════ */}
        {earnings_post.items.length > 0 && (
          <section className="py-8 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#f0b90b]/10 flex items-center justify-center text-base">
                {"📊"}
              </span>
              장후 실적발표
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-5">{earnings_post.subtitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {earnings_post.items.map((item) => {
                const colors = EARNINGS_COLORS[item.color] || EARNINGS_COLORS.purple;
                return (
                  <div
                    key={item.symbol}
                    className={`${colors.bg} border ${colors.border} rounded-xl p-4`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-mono font-bold text-sm ${colors.text}`}>{item.symbol}</span>
                      {item.quarter && (
                        <span className="text-xs text-[var(--text-muted)]">{item.quarter}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold mb-2">{item.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mb-2 font-mono">{item.eps}</p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.why}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════ EXPLAINERS ═══════ */}
        {explainers.map((exp, idx) => (
          <section key={idx} className="py-8 border-b border-[var(--border)]">
            {/* Badge + Title */}
            <div className="mb-6">
              <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-[#f0b90b]/15 text-[#f0b90b] mb-3">
                {exp.badge}
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold leading-snug">
                <RichText text={exp.title} />
              </h2>
            </div>

            {/* Q&A */}
            <div className="space-y-5 mb-6">
              {exp.qna.map((qa, qi) => (
                <div key={qi} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                  <p className="font-bold text-sm mb-2 flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f0b90b]/15 text-[#f0b90b] text-xs flex items-center justify-center font-bold mt-0.5">
                      Q
                    </span>
                    <span>{qa.q}</span>
                  </p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed ml-8">
                    <RichText text={qa.a} />
                  </p>
                </div>
              ))}
            </div>

            {/* Flow Timeline */}
            {exp.flow && exp.flow.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                  파급 경로
                </h3>
                <div className="relative pl-6">
                  {/* Vertical line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-[var(--border)]" />
                  <div className="space-y-4">
                    {exp.flow.map((step, si) => {
                      const dotColor = FLOW_COLORS[step.color] || "#71717a";
                      return (
                        <div key={si} className="relative flex items-start gap-4">
                          {/* Dot */}
                          <div
                            className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2"
                            style={{
                              borderColor: dotColor,
                              backgroundColor: `${dotColor}30`,
                            }}
                          />
                          <div>
                            <p className="text-sm font-bold" style={{ color: dotColor }}>
                              {step.title}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">{step.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Impact: Bullish / Bearish */}
            {exp.impact && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {/* Bullish */}
                <div className="bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-[#22c55e] mb-3 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                    수혜
                  </h4>
                  <ul className="space-y-2">
                    {exp.impact.bullish.map((item, bi) => (
                      <li key={bi} className="text-sm text-[var(--text-muted)] flex items-start gap-2">
                        <span className="text-[#22c55e] mt-0.5">+</span>
                        <RichText text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Bearish */}
                <div className="bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-[#ef4444] mb-3 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                    리스크
                  </h4>
                  <ul className="space-y-2">
                    {exp.impact.bearish.map((item, bi) => (
                      <li key={bi} className="text-sm text-[var(--text-muted)] flex items-start gap-2">
                        <span className="text-[#ef4444] mt-0.5">-</span>
                        <RichText text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* History */}
            {exp.history && exp.history.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                  역사적 사례
                </h3>
                <div className="space-y-3">
                  {exp.history.map((h, hi) => (
                    <div
                      key={hi}
                      className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex items-start gap-3"
                    >
                      {h.year && (
                        <span className="flex-shrink-0 text-xs font-mono font-bold text-[#f0b90b] bg-[#f0b90b]/10 px-2 py-1 rounded">
                          {h.year}
                        </span>
                      )}
                      <div>
                        {h.title && <p className="text-sm font-bold mb-1">{h.title}</p>}
                        {h.detail && (
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            <RichText text={h.detail} />
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}

        {/* ═══════ CHECKPOINTS ═══════ */}
        {checkpoints.length > 0 && (
          <section className="py-8">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center text-base">
                {"✅"}
              </span>
              체크포인트
            </h2>
            <div className="space-y-3">
              {checkpoints.map((cp) => (
                <div
                  key={cp.num}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex items-start gap-4"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#22c55e]/10 text-[#22c55e] text-sm font-bold flex items-center justify-center">
                    {cp.num}
                  </span>
                  <div>
                    <p className="text-sm font-bold mb-1">{cp.title}</p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      <RichText text={cp.desc} />
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] text-center">
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                본 콘텐츠는 투자 조언이 아닙니다. 모든 투자 결정은 본인의 판단에 따라 이루어져야 합니다.
              </p>
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
