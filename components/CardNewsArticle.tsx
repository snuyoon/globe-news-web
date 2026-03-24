"use client";

import React, { useState, useEffect, useCallback } from "react";

/* ── 타입 ── */
export interface SampleJSON {
  _schema_version?: string;
  meta: { date: string; day: string; handle: string; total_slides: number; brief_label?: string; cover_title?: string; cover_sub?: string };
  cover: { headline: string; tickers?: { name: string; value: string; color: string }[] };
  indicators?: { num: string; label: string; time?: string; values: string; hint_positive?: string; hint_negative?: string }[];
  indicators_label?: string;
  indicators_title?: string;
  earnings_pre?: { subtitle?: string; cat_label?: string; title?: string; items: { symbol: string; name: string; eps?: string; why?: string; color?: string; quarter?: string; status?: string }[] };
  earnings_post?: { subtitle?: string; cat_label?: string; title?: string; items: { symbol: string; name: string; eps?: string; why?: string; color?: string; quarter?: string; status?: string }[] };
  explainers?: {
    badge?: string; type?: string; title: string;
    qna?: {
      q: string;
      a: string;
      web_extended?: {
        deep_dive: string;
        data_points: string[];
        action_items: string[];
        related: string[];
      };
    }[];
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

/* ── 뒤집기 지표 카드 ── */
function FlippableIndicator({ ind }: { ind: NonNullable<SampleJSON["indicators"]>[number] }) {
  const [flipped, setFlipped] = useState(false);
  const hasHint = !!(ind.hint_positive || ind.hint_negative);

  return (
    <div
      onClick={() => hasHint && setFlipped((f) => !f)}
      className={hasHint ? "cursor-pointer" : ""}
      style={{ perspective: "600px" }}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* 앞면 */}
        <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)] min-h-[100px]" style={{ backfaceVisibility: "hidden" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold">{ind.label}</span>
            <div className="flex items-center gap-1.5">
              {ind.time && <span className="text-xs text-[var(--text-muted)] bg-[var(--bg)] px-2 py-0.5 rounded">{ind.time}</span>}
              {hasHint && (
                <span className="text-xs bg-[#f0b90b]/10 text-[#f0b90b] px-1.5 py-0.5 rounded">TAP</span>
              )}
            </div>
          </div>
          <p className="text-lg">{renderMarkup(ind.values)}</p>
        </div>

        {/* 뒷면 */}
        {hasHint && (
          <div
            className="absolute inset-0 bg-[var(--card)] rounded-xl p-5 border border-[#f0b90b]/30 flex flex-col justify-center gap-1.5"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="text-xs font-bold text-[#f0b90b] mb-1">{ind.label} 해석</span>
            {ind.hint_positive && (
              <p className="text-sm leading-snug text-[#22c55e]">
                <span className="font-bold">▲</span> {renderMarkup(ind.hint_positive)}
              </p>
            )}
            {ind.hint_negative && (
              <p className="text-sm leading-snug text-[#ef4444]">
                <span className="font-bold">▼</span> {renderMarkup(ind.hint_negative)}
              </p>
            )}
            <span className="text-xs text-[var(--text-muted)] mt-1">다시 탭하여 돌아가기</span>
          </div>
        )}
      </div>
    </div>
  );
}

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
          <button onClick={goPrev} className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 md:bg-white/10 backdrop-blur flex items-center justify-center text-white/60 md:text-white hover:bg-white/20 transition-colors text-sm md:text-base">
            ←
          </button>
        )}
        {/* 우측 화살표 */}
        {current < pages.length - 1 && (
          <button onClick={goNext} className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#f0b90b]/10 md:bg-[#f0b90b]/20 backdrop-blur flex items-center justify-center text-[#f0b90b]/60 md:text-[#f0b90b] hover:bg-[#f0b90b]/30 transition-colors text-sm md:text-base">
            →
          </button>
        )}

        <div className="h-full overflow-y-auto flex items-start justify-center px-4 md:px-16 py-4 md:py-8">
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

  // 1. 커버 — 크게
  pages.push(
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" key="cover">
      <div className="text-sm text-[#f0b90b] font-bold tracking-[0.3em] mb-4">{data.meta.brief_label || "BRIEFING"}</div>
      <p className="text-lg text-[var(--text-muted)] mb-8">{data.meta.date} {data.meta.day}</p>
      <h1 className="text-2xl md:text-4xl lg:text-6xl font-black leading-tight mb-6 md:mb-10 whitespace-pre-line">{renderMarkup(data.cover.headline)}</h1>
      {data.cover.tickers && data.cover.tickers.length > 0 && (
        <div className="flex gap-8 flex-wrap justify-center mb-10">
          {data.cover.tickers.map((t) => (
            <div key={t.name} className="text-center">
              <p className="text-sm text-[var(--text-muted)] mb-1">{t.name}</p>
              <p className={`text-2xl font-bold ${t.color === "green" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>{t.value}</p>
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
            <FlippableIndicator key={ind.num} ind={ind} />
          ))}
        </div>
        {data.indicators.some(i => i.hint_positive || i.hint_negative) && (
          <p className="text-center text-xs text-gray-500 mt-3 animate-pulse">👆 카드를 눌러서 해석을 확인해보세요!</p>
        )}
      </div>
    );
  }

  // 3. 어닝/뉴스 — 종목별 1페이지
  for (const [idx, section] of [data.earnings_pre, data.earnings_post].entries()) {
    if (!section?.items?.length) continue;
    // 섹션 타이틀 페이지
    pages.push(
      <div key={`earn-title-${idx}`} className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <p className="text-sm text-[#8b5cf6] font-bold tracking-widest mb-3">{section.cat_label || "EARNINGS"}</p>
        <h2 className="text-3xl font-bold mb-3">{renderMarkup(section.title || "실적발표")}</h2>
        {section.subtitle && <p className="text-base text-[var(--text-muted)]">{section.subtitle}</p>}
        <p className="text-sm text-[var(--text-muted)] mt-6">{section.items.length}개 종목 →</p>
      </div>
    );
    // 종목별 페이지
    for (const [ii, item] of section.items.entries()) {
      pages.push(
        <div key={`earn-${idx}-${ii}`} className="flex flex-col justify-center min-h-[40vh]">
          <p className="text-xs text-[var(--text-muted)] mb-2">{ii + 1} / {section.items.length}</p>
          <div className="bg-[var(--card)] rounded-2xl p-8 border border-[var(--border)]">
            <div className="flex items-center gap-4 mb-5">
              <span className="text-3xl font-black text-[#f0b90b]">{item.symbol}</span>
              <span className="text-xl font-bold">{item.name}</span>
            </div>
            {item.eps && <p className="text-lg text-[var(--text-muted)] mb-4">{renderMarkup(item.eps)}</p>}
            {item.why && <p className="text-base leading-relaxed">{renderMarkup(item.why)}</p>}
          </div>
        </div>
      );
    }
  }

  // 4. 설명서 — Q&A/flow/impact/history 각각 별도 페이지
  for (const [i, exp] of (data.explainers || []).entries()) {
    const header = (
      <div className="mb-6">
        <span className="text-sm text-[#f0b90b] font-bold">{exp.badge || "주린이 설명서"}</span>
        <h2 className="text-2xl md:text-3xl font-bold mt-2 whitespace-pre-line">{renderMarkup(exp.title)}</h2>
      </div>
    );

    // Q&A — 질문 하나당 1페이지 (web_extended 포함)
    if (exp.qna?.length) {
      for (const [qi, qa] of exp.qna.entries()) {
        pages.push(
          <div key={`exp${i}-q${qi}`}>
            {qi === 0 && header}
            {qi > 0 && <p className="text-xs text-[var(--text-muted)] mb-4">{exp.badge || "주린이 설명서"} · 계속</p>}
            <div className="bg-[var(--card)] rounded-2xl p-4 md:p-8 border border-[var(--border)]">
              <p className="text-base md:text-xl font-bold text-[#f0b90b] mb-3 md:mb-4">Q. {qa.q}</p>
              <p className="text-base md:text-lg leading-relaxed">{renderMarkup(qa.a)}</p>
            </div>

            {/* 웹 VIP 심화 콘텐츠 */}
            {qa.web_extended && (
              <div className="mt-4 space-y-3">
                {/* 심화 해설 */}
                {qa.web_extended.deep_dive && (
                  <div className="bg-[#1a1a2e] rounded-2xl p-4 md:p-6 border border-[#2a2a4a]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">🔍</span>
                      <span className="text-sm font-bold text-[#a78bfa] tracking-wider">심화 해설</span>
                    </div>
                    <p className="text-sm md:text-base leading-relaxed text-[var(--text-muted)]">{renderMarkup(qa.web_extended.deep_dive)}</p>
                  </div>
                )}

                {/* 데이터 포인트 */}
                {qa.web_extended.data_points?.length > 0 && (
                  <div className="bg-[#1a1a2e] rounded-2xl p-4 md:p-6 border border-[#2a2a4a]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">📊</span>
                      <span className="text-sm font-bold text-[#60a5fa] tracking-wider">데이터</span>
                    </div>
                    <ul className="space-y-2">
                      {qa.web_extended.data_points.map((dp, dpi) => (
                        <li key={dpi} className="flex items-start gap-2 text-sm md:text-base text-[var(--text-muted)]">
                          <span className="text-[#60a5fa] shrink-0 mt-0.5">•</span>
                          <span>{renderMarkup(dp)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 실전 체크 */}
                {qa.web_extended.action_items?.length > 0 && (
                  <div className="bg-[#1a1a2e] rounded-2xl p-4 md:p-6 border border-[#2a2a4a]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">💡</span>
                      <span className="text-sm font-bold text-[#34d399] tracking-wider">실전 체크</span>
                    </div>
                    <ul className="space-y-2">
                      {qa.web_extended.action_items.map((ai, aii) => (
                        <li key={aii} className="flex items-start gap-2 text-sm md:text-base text-[var(--text-muted)]">
                          <span className="text-[#34d399] shrink-0">✅</span>
                          <span>{renderMarkup(ai)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 관련 */}
                {qa.web_extended.related?.length > 0 && (
                  <div className="bg-[#1a1a2e] rounded-xl px-6 py-4 border border-[#2a2a4a]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🔗</span>
                      <span className="text-xs font-bold text-[var(--text-muted)] tracking-wider mr-2">관련</span>
                      <span className="text-sm text-[var(--text-muted)]">
                        {qa.web_extended.related.join(" · ")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
    }

    // Flow — 별도 1페이지
    if (exp.flow?.length) {
      pages.push(
        <div key={`exp${i}-flow`}>
          <p className="text-sm text-[#f0b90b] font-bold mb-2">{exp.badge || "주린이 설명서"}</p>
          <h3 className="text-2xl font-bold mb-6">📈 파급 경로</h3>
          <div className="space-y-4">
            {exp.flow.map((step, fi) => (
              <div key={fi} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: FLOW_COLORS[step.color] || "#6b7280" }} />
                  {fi < (exp.flow?.length || 0) - 1 && <div className="w-0.5 h-8 bg-[var(--border)]" />}
                </div>
                <div className="flex-1 bg-[var(--card)] rounded-xl px-5 py-4 border border-[var(--border)]">
                  <p className="font-bold text-lg">{step.title}</p>
                  <p className="text-[var(--text-muted)] text-base">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Impact — 별도 1페이지
    if (exp.impact) {
      pages.push(
        <div key={`exp${i}-impact`}>
          <p className="text-sm text-[#f0b90b] font-bold mb-2">{exp.badge || "주린이 설명서"}</p>
          <h3 className="text-2xl font-bold mb-6">⚖️ 수혜 vs 리스크</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-2xl p-6">
              <p className="text-lg font-bold text-[#22c55e] mb-4">{exp.impact.positive_label || "수혜 섹터"}</p>
              {exp.impact.bullish?.map((b, bi) => <p key={bi} className="text-base mb-2">✅ {b}</p>)}
            </div>
            <div className="bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-2xl p-6">
              <p className="text-lg font-bold text-[#ef4444] mb-4">{exp.impact.negative_label || "피해 섹터"}</p>
              {exp.impact.bearish?.map((b, bi) => <p key={bi} className="text-base mb-2">⚠️ {b}</p>)}
            </div>
          </div>
        </div>
      );
    }

    // History — 별도 1페이지
    if (exp.history?.length) {
      pages.push(
        <div key={`exp${i}-hist`}>
          <p className="text-sm text-[#f0b90b] font-bold mb-2">{exp.badge || "주린이 설명서"}</p>
          <h3 className="text-2xl font-bold mb-6">📚 과거에는 어땠나?</h3>
          <div className="space-y-4">
            {exp.history.map((h, hi) => (
              <div key={hi} className="bg-[var(--card)] rounded-2xl p-6 md:p-8 border border-[var(--border)]">
                <span className="text-sm text-[#f0b90b] font-bold">{h.year}</span>
                <p className="text-xl font-bold mt-2 mb-3">{h.title}</p>
                <p className="text-base text-[var(--text-muted)] leading-relaxed">{renderMarkup(h.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  // 5. 체크포인트
  if (data.checkpoints?.length) {
    pages.push(
      <div key="cp" className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">✅ 오늘의 체크포인트</h2>
        <div className="space-y-5 w-full">
          {data.checkpoints.map((cp) => (
            <div key={cp.num} className="flex gap-5 items-start">
              <span className="text-4xl font-black text-[#f0b90b] shrink-0 w-12 text-center">{cp.num}</span>
              <div className="bg-[var(--card)] rounded-2xl p-5 border border-[var(--border)] flex-1">
                <p className="text-lg font-bold mb-1">{cp.title}</p>
                <p className="text-base text-[var(--text-muted)]">{renderMarkup(cp.desc)}</p>
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
