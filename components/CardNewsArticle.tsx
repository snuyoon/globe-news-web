"use client";

import React, { useState, useEffect, useCallback } from "react";

/* ── 타입 ── */
export interface SampleJSON {
  _schema_version?: string;
  meta: { date: string; day: string; handle: string; total_slides: number; brief_label?: string; cover_title?: string; cover_sub?: string };
  cover: { headline: string; tickers?: { name: string; value: string; color: string }[] };
  indicators?: { num: string; label: string; time?: string; values: string }[];
  indicators_label?: string;
  indicators_title?: string;
  earnings_pre?: { subtitle?: string; cat_label?: string; title?: string; items: { symbol: string; name: string; eps?: string; why?: string; color?: string; quarter?: string; status?: string }[] };
  earnings_post?: { subtitle?: string; cat_label?: string; title?: string; items: { symbol: string; name: string; eps?: string; why?: string; color?: string; quarter?: string; status?: string }[] };
  explainers?: {
    badge?: string; type?: string; title: string;
    qna?: { q: string; a: string }[];
    flow?: { title: string; detail: string; color: string }[];
    impact?: { positive_label?: string; negative_label?: string; bullish?: string[]; bearish?: string[] };
    history?: { year: string; title: string; desc: string }[];
    checklist?: { text: string }[];
  }[];
  checkpoints?: { num: string; title: string; desc: string }[];
}

/* ── 마크업 파서 ── */
function renderMarkup(text: string) {
  if (!text) return null;
  const parts: (string | React.ReactNode)[] = [];
  const tagMap: Record<string, string> = {
    strong: "text-white font-bold",
    green: "text-[#22c55e] font-semibold",
    red: "text-[#ef4444] font-semibold",
    yellow: "text-[#f0b90b] font-semibold",
    "em-yellow": "text-[#f0b90b] text-xl font-bold",
    "em-red": "text-[#ef4444] text-xl font-bold",
    "em-green": "text-[#22c55e] text-xl font-bold",
    "hl-box": "bg-[#f0b90b]/20 text-[#f0b90b] px-1.5 py-0.5 rounded font-bold",
  };
  const regex = /<(strong|green|red|yellow|em-yellow|em-red|em-green|hl-box)>([\s\S]*?)<\/\1>/g;
  let lastIndex = 0;
  let key = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<span key={key++} className={tagMap[match[1]] || ""}>{match[2]}</span>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}

const FLOW_COLORS: Record<string, string> = {
  red: "#ef4444", yellow: "#f0b90b", green: "#22c55e", purple: "#8b5cf6", pink: "#ec4899", blue: "#3b82f6",
};

/* ── 메인: 페이지 넘기기 형태 ── */
export default function CardNewsArticle({ data, onClose }: { data: SampleJSON; onClose: () => void }) {
  const pages = buildPages(data);
  const [current, setCurrent] = useState(0);

  const goNext = useCallback(() => setCurrent((p) => Math.min(p + 1, pages.length - 1)), [pages.length]);
  const goPrev = useCallback(() => setCurrent((p) => Math.max(p - 1, 0)), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [goNext, goPrev, onClose]);

  // 터치 스와이프
  useEffect(() => {
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
    };
    window.addEventListener("touchstart", onStart);
    window.addEventListener("touchend", onEnd);
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, [goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#08080d] flex flex-col">
      {/* 상단 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] shrink-0">
        <span className="text-sm text-[var(--text-muted)] font-medium">{data.meta.brief_label || "BRIEFING"}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#f0b90b]">{current + 1}</span>
          <span className="text-sm text-[var(--text-muted)]">/ {pages.length}</span>
        </div>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
        </button>
      </div>

      {/* 페이지 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 좌측 화살표 */}
        {current > 0 && (
          <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            ←
          </button>
        )}
        {/* 우측 화살표 */}
        {current < pages.length - 1 && (
          <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#f0b90b]/20 backdrop-blur flex items-center justify-center text-[#f0b90b] hover:bg-[#f0b90b]/30 transition-colors">
            →
          </button>
        )}

        <div className="h-full overflow-y-auto flex items-start justify-center px-12 md:px-16 py-8">
          <div className="w-full max-w-xl">
            {pages[current]}
          </div>
        </div>
      </div>

      {/* 하단 인디케이터 */}
      <div className="flex items-center justify-center gap-1.5 py-3 border-t border-[var(--border)] shrink-0">
        {pages.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`rounded-full transition-all ${i === current ? "w-6 h-2 bg-[#f0b90b]" : "w-2 h-2 bg-[var(--border)] hover:bg-[var(--text-muted)]"}`} />
        ))}
      </div>
    </div>
  );
}

/* ── 페이지 빌더 ── */
function buildPages(data: SampleJSON): React.ReactNode[] {
  const pages: React.ReactNode[] = [];

  // 1. 커버
  pages.push(
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center" key="cover">
      <div className="text-xs text-[#f0b90b] font-bold tracking-[0.3em] mb-3">{data.meta.brief_label || "BRIEFING"}</div>
      <p className="text-sm text-[var(--text-muted)] mb-6">{data.meta.date} {data.meta.day}</p>
      <h1 className="text-2xl md:text-3xl font-black leading-tight mb-8 whitespace-pre-line">{renderMarkup(data.cover.headline)}</h1>
      {data.cover.tickers && data.cover.tickers.length > 0 && (
        <div className="flex gap-5 flex-wrap justify-center mb-8">
          {data.cover.tickers.map((t) => (
            <div key={t.name} className="text-center">
              <p className="text-xs text-[var(--text-muted)] mb-0.5">{t.name}</p>
              <p className={`text-lg font-bold ${t.color === "green" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>{t.value}</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-[var(--text-muted)]/50 mt-4">← → 또는 스와이프로 넘기세요</p>
    </div>
  );

  // 2. 지표
  if (data.indicators && data.indicators.length > 0) {
    pages.push(
      <div key="indicators">
        <p className="text-xs text-[#f0b90b] font-bold tracking-widest mb-2">{data.indicators_label || "ECONOMIC DATA"}</p>
        <h2 className="text-xl font-bold mb-6">{renderMarkup(data.indicators_title || "경제 지표")}</h2>
        <div className="space-y-3">
          {data.indicators.map((ind) => (
            <div key={ind.num} className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{ind.label}</span>
                {ind.time && <span className="text-xs text-[var(--text-muted)] bg-[var(--bg)] px-2 py-0.5 rounded">{ind.time}</span>}
              </div>
              <p className="text-lg">{renderMarkup(ind.values)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. 어닝/뉴스
  for (const [idx, section] of [data.earnings_pre, data.earnings_post].entries()) {
    if (!section?.items?.length) continue;
    pages.push(
      <div key={`earn-${idx}`}>
        <p className="text-xs text-[#8b5cf6] font-bold tracking-widest mb-2">{section.cat_label || "EARNINGS"}</p>
        <h2 className="text-xl font-bold mb-2">{renderMarkup(section.title || "실적발표")}</h2>
        {section.subtitle && <p className="text-sm text-[var(--text-muted)] mb-6">{section.subtitle}</p>}
        <div className="space-y-3">
          {section.items.map((item) => (
            <div key={item.symbol} className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[#f0b90b] font-bold text-lg">{item.symbol}</span>
                <span className="font-semibold">{item.name}</span>
              </div>
              {item.eps && <p className="text-sm text-[var(--text-muted)] mb-2">{renderMarkup(item.eps)}</p>}
              {item.why && <p className="text-sm leading-relaxed">{renderMarkup(item.why)}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. 설명서 (각각 1페이지)
  for (const [i, exp] of (data.explainers || []).entries()) {
    const els: React.ReactNode[] = [];

    els.push(
      <div key="h" className="mb-6">
        <span className="text-xs text-[#f0b90b] font-bold">{exp.badge || "주린이 설명서"}</span>
        <h2 className="text-xl font-bold mt-2 whitespace-pre-line">{renderMarkup(exp.title)}</h2>
      </div>
    );

    if (exp.qna?.length) {
      for (const [qi, qa] of exp.qna.entries()) {
        els.push(
          <div key={`q${qi}`} className="mb-5 bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
            <p className="text-sm font-bold text-[#f0b90b] mb-2">Q. {qa.q}</p>
            <p className="text-[15px] leading-relaxed">{renderMarkup(qa.a)}</p>
          </div>
        );
      }
    }

    if (exp.flow?.length) {
      els.push(
        <div key="flow" className="mt-4 space-y-3">
          <p className="text-sm font-bold text-[var(--text-muted)] mb-2">📈 파급 경로</p>
          {exp.flow.map((step, fi) => (
            <div key={fi} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: FLOW_COLORS[step.color] || "#6b7280" }} />
              <div className="flex-1 bg-[var(--card)] rounded-lg px-4 py-2.5 border border-[var(--border)]">
                <span className="font-bold text-sm">{step.title}</span>
                <span className="text-[var(--text-muted)] text-sm ml-2">{step.detail}</span>
              </div>
              {fi < (exp.flow?.length || 0) - 1 && <span className="text-[var(--text-muted)] text-xs">→</span>}
            </div>
          ))}
        </div>
      );
    }

    if (exp.impact) {
      els.push(
        <div key="impact" className="mt-5 grid grid-cols-2 gap-3">
          <div className="bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-xl p-4">
            <p className="text-sm font-bold text-[#22c55e] mb-3">{exp.impact.positive_label || "수혜"}</p>
            {exp.impact.bullish?.map((b, bi) => <p key={bi} className="text-sm mb-1">• {b}</p>)}
          </div>
          <div className="bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-xl p-4">
            <p className="text-sm font-bold text-[#ef4444] mb-3">{exp.impact.negative_label || "피해"}</p>
            {exp.impact.bearish?.map((b, bi) => <p key={bi} className="text-sm mb-1">• {b}</p>)}
          </div>
        </div>
      );
    }

    if (exp.history?.length) {
      els.push(
        <div key="hist" className="mt-5 space-y-3">
          <p className="text-sm font-bold text-[var(--text-muted)] mb-2">📚 과거 사례</p>
          {exp.history.map((h, hi) => (
            <div key={hi} className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
              <span className="text-xs text-[#f0b90b] font-bold">{h.year}</span>
              <p className="font-bold mt-1">{h.title}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">{renderMarkup(h.desc)}</p>
            </div>
          ))}
        </div>
      );
    }

    pages.push(<div key={`exp-${i}`}>{els}</div>);
  }

  // 5. 체크포인트
  if (data.checkpoints?.length) {
    pages.push(
      <div key="cp" className="flex flex-col items-center justify-center min-h-[40vh]">
        <h2 className="text-xl font-bold mb-8 text-center">✅ 오늘의 체크포인트</h2>
        <div className="space-y-5 w-full">
          {data.checkpoints.map((cp) => (
            <div key={cp.num} className="flex gap-4 items-start">
              <span className="text-3xl font-black text-[#f0b90b] shrink-0 w-10 text-center">{cp.num}</span>
              <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] flex-1">
                <p className="font-bold mb-1">{cp.title}</p>
                <p className="text-sm text-[var(--text-muted)]">{renderMarkup(cp.desc)}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)]/50 mt-8 text-center">본 콘텐츠는 정보 제공 목적이며 투자 조언이 아닙니다</p>
      </div>
    );
  }

  return pages;
}
