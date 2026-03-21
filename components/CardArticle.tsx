"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { CardNews } from "@/lib/supabase";

/* ── SampleJson 타입 ── */
interface Ticker { name: string; value: string; color: string; }
interface Indicator { num: string; label: string; values: string; time: string; }
interface EarningItem { symbol: string; name: string; eps: string; why: string; color: string; status: string; quarter: string; }
interface EarningsSection { title: string; subtitle: string; cat_label: string; items: EarningItem[]; }
interface QnaWebExtended { deep_dive: string; data_points: string[]; action_items: string[]; related: string[]; }
interface Qna { q: string; a: string; web_extended?: QnaWebExtended; }
interface FlowStep { title: string; detail: string; color: string; }
interface Impact { positive_label: string; negative_label: string; bullish: string[]; bearish: string[]; }
interface HistoryItem { year: string; title: string; desc: string; }
interface ChecklistItem { text: string; }

interface Explainer {
  type: "qna" | "flow" | "impact" | "history" | "checklist";
  badge: string;
  title: string;
  qna?: Qna[];
  flow?: FlowStep[];
  impact?: Impact;
  history?: HistoryItem[];
  checklist?: ChecklistItem[];
}

interface Checkpoint { num: string; title: string; desc: string; }

interface SampleJson {
  meta: { date: string; day: string; handle: string; cover_title: string; cover_sub: string; brief_label: string; total_slides: number; };
  cover: { headline: string; tickers: Ticker[]; cover_image?: string; };
  indicators: Indicator[];
  indicators_label: string;
  indicators_title: string;
  earnings_pre: EarningsSection;
  earnings_post: { subtitle: string; items: EarningItem[]; };
  explainers: Explainer[];
  checkpoints: Checkpoint[];
}

interface CardArticleProps {
  card: CardNews;
  onClose: () => void;
}

/* ── 마크업 파서 (XSS sanitize) ── */
const ALLOWED_TAGS: Record<string, string> = {
  strong: "color:#fff;font-weight:700",
  green: "color:#22c55e;font-weight:600",
  red: "color:#ef4444;font-weight:600",
  yellow: "color:#eab308;font-weight:600",
  "hl-box": "background:rgba(240,185,11,0.2);color:#f0b90b;padding:2px 6px;border-radius:4px;font-weight:700",
  "em-red": "color:#ef4444;font-size:1.25rem;font-weight:700",
  "em-yellow": "color:#eab308;font-size:1.25rem;font-weight:700",
  "em-purple": "color:#8b5cf6;font-size:1.25rem;font-weight:700",
  "em-green": "color:#22c55e;font-size:1.25rem;font-weight:700",
};

function parseMarkup(text: string): string {
  if (!text) return "";
  let s = text;

  // Handle <br> / <br/>
  s = s.replace(/<br\s*\/?>/gi, "<br/>");

  // Handle <span class="accent">...</span>
  s = s.replace(/<span\s+class="accent">([\s\S]*?)<\/span>/gi, '<span style="color:#f0b90b;font-weight:600">$1</span>');

  // Handle allowed custom tags
  for (const [tag, style] of Object.entries(ALLOWED_TAGS)) {
    const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "gi");
    s = s.replace(re, `<span style="${style}">$1</span>`);
  }

  // Strip any remaining HTML tags that aren't span or br (XSS protection)
  s = s.replace(/<(?!\/?(?:span|br)\b)[^>]*>/gi, "");

  return s;
}

function Markup({ text }: { text: string }) {
  return <span dangerouslySetInnerHTML={{ __html: parseMarkup(text) }} />;
}

/* ── 색상 맵 ── */
const FLOW_COLORS: Record<string, string> = {
  red: "#ef4444", yellow: "#f0b90b", green: "#22c55e", purple: "#8b5cf6", pink: "#ec4899", blue: "#3b82f6", orange: "#f97316",
};

/* ── 페이지 빌더: sample_json → 페이지 배열 ── */
function buildPages(data: SampleJson): { label: string; render: () => React.ReactNode }[] {
  const pages: { label: string; render: () => React.ReactNode }[] = [];

  // 1. 커버
  pages.push({ label: "커버", render: () => <HeroHeader data={data} /> });

  // 2. 지수
  if (data.indicators?.length > 0) {
    pages.push({ label: "지수", render: () => <IndicatorsSection data={data} /> });
  }

  // 3. 어닝
  if (data.earnings_pre?.items?.length > 0) {
    pages.push({ label: "어닝", render: () => <EarningsSection section={data.earnings_pre} /> });
  }
  if (data.earnings_post?.items?.length > 0) {
    pages.push({ label: "어닝", render: () => <EarningsSection section={data.earnings_post as EarningsSection} /> });
  }

  // 4. 설명서 각각 1페이지
  data.explainers?.forEach((exp, i) => {
    const typeLabel = { qna: "Q&A", flow: "흐름", impact: "분석", history: "사례", checklist: "체크" }[exp.type] || "설명";
    pages.push({ label: typeLabel, render: () => <ExplainerSection explainer={exp} key={`exp-${i}`} /> });
  });

  // 5. 체크포인트
  if (data.checkpoints?.length > 0) {
    pages.push({ label: "포인트", render: () => <CheckpointsSection checkpoints={data.checkpoints} /> });
  }

  // 6. CTA
  pages.push({ label: "마무리", render: () => <BottomCTA handle={data.meta.handle} /> });

  return pages;
}

/* ── 메인 컴포넌트 ── */
export default function CardArticle({ card, onClose }: CardArticleProps) {
  const data = (card as CardNews & { sample_json?: SampleJson }).sample_json;
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const pages = data ? buildPages(data) : [];
  const total = pages.length;

  const goPrev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const goNext = useCallback(() => setCurrent((c) => Math.min(total - 1, c + 1)), [total]);

  // 페이지 바뀔 때 스크롤 맨 위로
  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [current]);

  // ESC/방향키 + body 스크롤 잠금
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, goPrev, goNext]);

  // 터치 스와이프
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) goNext(); else goPrev();
    }
  };

  if (!data || total === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a12] flex flex-col">
      {/* 상단 바: 닫기 + 페이지 번호 + 프로그레스 */}
      <div className="flex-shrink-0 relative z-[101]">
        {/* 프로그레스 바 */}
        <div className="h-0.5 bg-[#1a1a2e]">
          <div
            className="h-full bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] transition-all duration-300"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="닫기"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
          </button>
          <span className="text-xs text-[var(--text-muted)] font-medium">
            {current + 1} / {total}
          </span>
          <span className="text-xs text-[#f0b90b] font-semibold w-8 text-right">
            {pages[current].label}
          </span>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-24 min-h-full">
          {pages[current].render()}
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex-shrink-0 border-t border-[#1a1a2e] bg-[#0a0a12]/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* 이전 */}
          <button
            onClick={goPrev}
            disabled={current === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-20 disabled:cursor-default text-[var(--text-muted)] hover:text-white hover:bg-white/5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            이전
          </button>

          {/* 도트 인디케이터 */}
          <div className="flex gap-1">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current
                    ? "w-5 h-1.5 bg-[#f0b90b]"
                    : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`${i + 1}페이지`}
              />
            ))}
          </div>

          {/* 다음 */}
          {current < total - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-[#f0b90b]/10 text-[#f0b90b] hover:bg-[#f0b90b]/20 transition-colors"
            >
              다음
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-[#f0b90b] text-black hover:opacity-90 transition-opacity"
            >
              완료
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 구분선 ── */
function Divider() {
  return <div className="my-8 md:my-10 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />;
}

/* ── A. 히어로 헤더 ── */
function HeroHeader({ data }: { data: SampleJson }) {
  const coverImage = data.cover.cover_image;

  return (
    <section className="text-center pt-8 md:pt-16 relative overflow-hidden rounded-2xl">
      {/* 블러 배경 이미지 */}
      {coverImage && (
        <div
          className="absolute inset-0 -m-8 scale-110"
          style={{
            backgroundImage: `url(${coverImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(18px) brightness(0.18)",
          }}
        />
      )}
      <div className="relative z-10">
        {/* brief_label 뱃지 */}
        <span className="inline-block text-xs font-bold tracking-[0.2em] text-[#f0b90b] bg-[#f0b90b]/10 px-3 py-1 rounded-full mb-6">
          {data.meta.brief_label || "BRIEFING"}
        </span>

        {/* headline */}
        <h1
          className="text-2xl md:text-4xl font-black leading-tight mb-4"
          dangerouslySetInnerHTML={{ __html: parseMarkup(data.cover.headline.replace(/\n/g, "<br/>")) }}
        />

        {/* date + handle */}
        <p className="text-sm text-[var(--text-muted)] mb-8">
          {data.meta.date} {data.meta.day} &middot; {data.meta.handle}
        </p>

        {/* tickers */}
        {data.cover.tickers?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {data.cover.tickers.map((t) => (
              <span
                key={t.name}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                  t.color === "green"
                    ? "text-[#22c55e] border-[#22c55e]/20 bg-[#22c55e]/5"
                    : "text-[#ef4444] border-[#ef4444]/20 bg-[#ef4444]/5"
                }`}
              >
                <span className="text-[var(--text-muted)] text-xs">{t.name}</span>
                {t.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── B. 지수 카드 ── */
function IndicatorsSection({ data }: { data: SampleJson }) {
  return (
    <section>
      <SectionBadge label={data.indicators_label || "ECONOMIC DATA"} />
      <h2 className="text-xl md:text-2xl font-bold mb-6">
        <Markup text={data.indicators_title || "주요 경제 지표"} />
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.indicators.map((ind) => {
          const isUp = ind.values.includes("▲");
          const isDown = ind.values.includes("▼");
          return (
            <div key={ind.num} className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-white">{ind.label}</span>
                {ind.time && <span className="text-[10px] text-[var(--text-muted)] bg-[#0a0a12] px-2 py-0.5 rounded">{ind.time}</span>}
              </div>
              <p className={`text-base font-semibold ${isUp ? "text-[#22c55e]" : isDown ? "text-[#ef4444]" : "text-white"}`}>
                <Markup text={ind.values} />
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── C. 어닝 섹션 ── */
function EarningsSection({ section }: { section: EarningsSection }) {
  const statusStyles: Record<string, string> = {
    beat: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20",
    miss: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20",
    pending: "bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20",
  };

  return (
    <section>
      <SectionBadge label={section.cat_label || "EARNINGS"} />
      {section.title && (
        <h2
          className="text-xl md:text-2xl font-bold mb-2"
          dangerouslySetInnerHTML={{ __html: parseMarkup(section.title) }}
        />
      )}
      {section.subtitle && <p className="text-sm text-[var(--text-muted)] mb-6">{section.subtitle}</p>}

      <div className="space-y-3">
        {section.items.map((item, i) => (
          <div key={i} className="bg-[var(--card)] rounded-xl p-4 md:p-5 border border-[var(--border)] hover:border-[#f0b90b]/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-[#f0b90b]">{item.symbol}</span>
                <span className="text-sm font-bold text-white">{item.name}</span>
              </div>
              {item.status && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyles[item.status] || statusStyles.pending}`}>
                  {item.status.toUpperCase()}
                </span>
              )}
            </div>
            {item.eps && <p className="text-sm text-[var(--text-muted)] mb-1"><Markup text={item.eps} /></p>}
            {item.why && <p className="text-sm leading-relaxed"><Markup text={item.why} /></p>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── D. Explainer 섹션 ── */
function ExplainerSection({ explainer }: { explainer: Explainer }) {
  return (
    <section>
      <SectionBadge label={explainer.badge || "주린이 설명서"} />
      <h2 className="text-xl md:text-2xl font-bold mb-6">
        <Markup text={explainer.title} />
      </h2>

      {explainer.type === "qna" && explainer.qna && <QnaRenderer items={explainer.qna} />}
      {explainer.type === "flow" && explainer.flow && <FlowRenderer steps={explainer.flow} />}
      {explainer.type === "impact" && explainer.impact && <ImpactRenderer impact={explainer.impact} />}
      {explainer.type === "history" && explainer.history && <HistoryRenderer items={explainer.history} />}
      {explainer.type === "checklist" && explainer.checklist && <ChecklistRenderer items={explainer.checklist} />}
    </section>
  );
}

/* Q&A — deep dive 없으면 펼침, 있으면 아코디언 */
function QnaRenderer({ items }: { items: Qna[] }) {
  const hasAnyDeepDive = items.some((qa) => qa.web_extended);
  const [openIdx, setOpenIdx] = useState<number | null>(hasAnyDeepDive ? null : 0);
  const [deepDiveOpen, setDeepDiveOpen] = useState<Record<number, boolean>>({});

  // deep dive 없으면 전부 펼침
  const alwaysOpen = !hasAnyDeepDive;

  return (
    <div className="space-y-3">
      {items.map((qa, i) => {
        const isOpen = alwaysOpen || openIdx === i;
        return (
          <div key={i} className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
            {/* 질문 */}
            <button
              onClick={() => !alwaysOpen && setOpenIdx(isOpen ? null : i)}
              className={`w-full flex items-center justify-between px-4 md:px-5 py-4 text-left hover:bg-white/[0.02] transition-colors ${alwaysOpen ? "cursor-default" : ""}`}
            >
              <span className="text-sm md:text-base font-bold text-[#f0b90b] pr-4">Q. {qa.q}</span>
              {!alwaysOpen && (
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {/* 답변 */}
            <div className={alwaysOpen ? "" : `transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-4 md:px-5 pb-4">
                <p className="text-sm md:text-base leading-relaxed text-[var(--text-muted)]">
                  <Markup text={qa.a} />
                </p>

                {/* VIP: web_extended */}
                {qa.web_extended && (
                  <div className="mt-4">
                    <button
                      onClick={() => setDeepDiveOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
                    >
                      <span>Deep Dive</span>
                      <svg
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className={`transition-transform duration-200 ${deepDiveOpen[i] ? "rotate-180" : ""}`}
                      >
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${deepDiveOpen[i] ? "max-h-[3000px] opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
                      <div className="space-y-3">
                        {/* deep_dive */}
                        {qa.web_extended.deep_dive && (
                          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a4a]">
                            <p className="text-xs font-bold text-[#a78bfa] tracking-wider mb-2">심화 해설</p>
                            <p className="text-sm leading-relaxed text-[var(--text-muted)]"><Markup text={qa.web_extended.deep_dive} /></p>
                          </div>
                        )}

                        {/* data_points */}
                        {qa.web_extended.data_points?.length > 0 && (
                          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a4a]">
                            <p className="text-xs font-bold text-[#60a5fa] tracking-wider mb-2">데이터 포인트</p>
                            <ul className="space-y-1.5">
                              {qa.web_extended.data_points.map((dp, di) => (
                                <li key={di} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                                  <span className="text-[#60a5fa] shrink-0 mt-0.5">&#8226;</span>
                                  <Markup text={dp} />
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* action_items */}
                        {qa.web_extended.action_items?.length > 0 && (
                          <div className="bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a4a]">
                            <p className="text-xs font-bold text-[#34d399] tracking-wider mb-2">실전 체크</p>
                            <ul className="space-y-1.5">
                              {qa.web_extended.action_items.map((ai, aii) => (
                                <li key={aii} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                                  <span className="text-[#34d399] shrink-0">&#10003;</span>
                                  <Markup text={ai} />
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* related */}
                        {qa.web_extended.related?.length > 0 && (
                          <div className="bg-[#1a1a2e] rounded-xl px-4 py-3 border border-[#2a2a4a]">
                            <span className="text-xs font-bold text-[var(--text-muted)] tracking-wider mr-2">관련</span>
                            <span className="text-sm text-[var(--text-muted)]">{qa.web_extended.related.join(" &middot; ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Flow 타임라인 */
function FlowRenderer({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: FLOW_COLORS[step.color] || "#6b7280" }} />
            {i < steps.length - 1 && <div className="w-0.5 flex-1 min-h-[40px] bg-[var(--border)]" />}
          </div>
          <div className="flex-1 pb-5">
            <p className="text-sm md:text-base font-bold text-white mb-1">{step.title}</p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed"><Markup text={step.detail} /></p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Impact 2컬럼 */
function ImpactRenderer({ impact }: { impact: Impact }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-xl p-4 md:p-5">
        <p className="text-sm font-bold text-[#22c55e] mb-3">{impact.positive_label || "수혜"}</p>
        <ul className="space-y-2">
          {impact.bullish?.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-[#22c55e] shrink-0">&#9650;</span>
              <Markup text={b} />
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-xl p-4 md:p-5">
        <p className="text-sm font-bold text-[#ef4444] mb-3">{impact.negative_label || "리스크"}</p>
        <ul className="space-y-2">
          {impact.bearish?.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-[#ef4444] shrink-0">&#9660;</span>
              <Markup text={b} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* History 카드 */
function HistoryRenderer({ items }: { items: HistoryItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((h, i) => (
        <div key={i} className="bg-[var(--card)] rounded-xl p-4 md:p-5 border border-[var(--border)]">
          <span className="inline-block text-[10px] font-bold text-[#f0b90b] bg-[#f0b90b]/10 px-2 py-0.5 rounded-full mb-2">{h.year}</span>
          <p className="text-sm font-bold text-white mb-1">{h.title}</p>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed"><Markup text={h.desc} /></p>
        </div>
      ))}
    </div>
  );
}

/* Checklist */
function ChecklistRenderer({ items }: { items: ChecklistItem[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[#f0b90b]/20 transition-colors text-left"
        >
          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
            checked[i] ? "bg-[#f0b90b] border-[#f0b90b] text-black" : "border-[var(--text-muted)]/30"
          }`}>
            {checked[i] && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </span>
          <span className={`text-sm transition-colors ${checked[i] ? "text-[var(--text-muted)] line-through" : "text-white"}`}>
            <Markup text={item.text} />
          </span>
        </button>
      ))}
    </div>
  );
}

/* ── E. 체크포인트 ── */
function CheckpointsSection({ checkpoints }: { checkpoints: Checkpoint[] }) {
  return (
    <section>
      <SectionBadge label="CHECKPOINTS" />
      <h2 className="text-xl md:text-2xl font-bold mb-6">오늘의 체크포인트</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checkpoints.map((cp) => (
          <div key={cp.num} className="bg-[var(--card)] rounded-xl p-4 md:p-5 border border-[var(--border)]">
            <span className="inline-block text-2xl font-black text-[#f0b90b] mb-2">{cp.num}</span>
            <p className="text-sm font-bold text-white mb-1">{cp.title}</p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed"><Markup text={cp.desc} /></p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── F. 하단 CTA ── */
function BottomCTA({ handle }: { handle: string }) {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      {/* 로고 */}
      <div className="text-3xl font-black tracking-wider text-[#00d28c] mb-6">US SOKBO</div>

      {/* 메인 메시지 */}
      <h2 className="text-xl md:text-2xl font-bold mb-2">오늘 브리핑은 여기까지!</h2>
      <p className="text-sm text-[var(--text-muted)] mb-10 max-w-sm">
        매일 아침·저녁 AI가 분석한 미국 시장 브리핑을<br />가장 먼저 받아보세요
      </p>

      {/* SNS 링크 */}
      <div className="flex flex-col gap-3 w-full max-w-xs mb-10">
        <a
          href="https://x.com/US_sokbo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#f0b90b] text-black text-sm font-bold hover:opacity-90 transition-opacity"
        >
          {handle || "@US_sokbo"} 팔로우
        </a>
        <div className="flex gap-3">
          <a
            href="https://www.instagram.com/us_sokbo/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-[var(--border)] text-[var(--text-muted)] text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Instagram
          </a>
          <a
            href="https://www.threads.net/@us_sokbo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-[var(--border)] text-[var(--text-muted)] text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Threads
          </a>
        </div>
      </div>

      {/* 면책 */}
      <p className="text-[10px] text-[var(--text-muted)]/50">본 콘텐츠는 정보 제공 목적이며 투자 조언이 아닙니다</p>
    </section>
  );
}

/* ── 공통: 섹션 뱃지 ── */
function SectionBadge({ label }: { label: string }) {
  return (
    <span className="inline-block text-[10px] font-bold tracking-[0.15em] text-[#f0b90b] bg-[#f0b90b]/10 px-2.5 py-1 rounded-full mb-3">
      {label}
    </span>
  );
}
