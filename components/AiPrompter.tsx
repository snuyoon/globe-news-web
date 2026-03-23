"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

interface StockAnalysis {
  ticker: string;
  impact: "high" | "medium" | "low";
  analysis: string;
}

interface PrompterResult {
  stocks: StockAnalysis[];
  summary: string;
}

const IMPACT_CONFIG = {
  high: { label: "상", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  medium: { label: "중", color: "#eab308", bg: "rgba(234,179,8,0.1)" },
  low: { label: "하", color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
};

function SkeletonCard() {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-16 h-6 rounded-lg bg-[var(--border)] animate-pulse" />
        <div className="w-8 h-5 rounded-full bg-[var(--border)] animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 rounded bg-[var(--border)] animate-pulse w-full" />
        <div className="h-3.5 rounded bg-[var(--border)] animate-pulse w-4/5" />
        <div className="h-3.5 rounded bg-[var(--border)] animate-pulse w-3/5" />
      </div>
    </div>
  );
}

function SkeletonSummary() {
  return (
    <div className="rounded-xl p-4 mt-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="w-24 h-5 rounded bg-[var(--border)] animate-pulse mb-3" />
      <div className="space-y-2">
        <div className="h-3.5 rounded bg-[var(--border)] animate-pulse w-full" />
        <div className="h-3.5 rounded bg-[var(--border)] animate-pulse w-5/6" />
        <div className="h-3.5 rounded bg-[var(--border)] animate-pulse w-4/6" />
        <div className="h-3.5 rounded bg-[var(--border)] animate-pulse w-full" />
      </div>
    </div>
  );
}

export default function AiPrompter({ newsId, newsText }: { newsId: string; newsText: string }) {
  const { user, isSubscriber, isAdmin } = useAuth();
  const isUltra = isSubscriber || isAdmin;

  const [result, setResult] = useState<PrompterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleAnalyze = async () => {
    if (!isUltra) {
      setShowModal(true);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bjdlyjeltwjukuthxkti.supabase.co"}/functions/v1/ai-prompter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId, newsText }),
      });

      if (!res.ok) throw new Error("분석 실패");

      const data: PrompterResult = await res.json();
      setResult(data);
    } catch {
      setError("분석에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 pt-5 border-t border-[var(--border)]">
      {/* 분석 버튼 */}
      {!result && !loading && (
        <button
          onClick={handleAnalyze}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-[15px] transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(168,85,247,0.25)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          AI 포트폴리오 분석
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            Ultra
          </span>
        </button>
      )}

      {/* 로딩 스켈레톤 */}
      {loading && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--text-muted)]">AI가 포트폴리오 영향을 분석하고 있습니다...</span>
          </div>
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonSummary />
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="mt-3">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20">
            <span className="text-sm">&#9888;&#65039;</span>
            <span className="text-sm text-[#ef4444]">{error}</span>
          </div>
          <button
            onClick={handleAnalyze}
            className="mt-3 w-full py-3 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-muted)] hover:text-white hover:border-[#a855f7]/50 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 결과 패널 */}
      {result && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-sm font-bold px-2.5 py-1 rounded-full"
              style={{ background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)", color: "#fff" }}
            >
              AI 분석 결과
            </span>
          </div>

          {/* 종목별 카드 */}
          <div className="flex flex-col gap-3">
            {result.stocks.map((stock) => {
              const impact = IMPACT_CONFIG[stock.impact];
              return (
                <div
                  key={stock.ticker}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: "var(--bg)",
                    borderLeft: `3px solid ${impact.color}`,
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span
                      className="text-sm font-bold px-2.5 py-0.5 rounded-lg"
                      style={{ backgroundColor: "rgba(240,185,11,0.1)", color: "#f0b90b" }}
                    >
                      ${stock.ticker}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: impact.bg, color: impact.color }}
                    >
                      영향 {impact.label}
                    </span>
                  </div>
                  <p className="text-[14px] text-[var(--text-muted)] leading-[1.8]">
                    {stock.analysis}
                  </p>
                </div>
              );
            })}
          </div>

          {/* 종합 분석 */}
          {result.summary && (
            <div
              className="mt-4 rounded-xl p-4"
              style={{
                backgroundColor: "var(--bg)",
                borderLeft: "3px solid #a855f7",
              }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-base">&#128202;</span>
                <h4 className="text-sm font-bold" style={{ color: "#a855f7" }}>
                  종합 분석
                </h4>
              </div>
              <p className="text-[14px] text-[var(--text-muted)] leading-[1.8]">
                {result.summary}
              </p>
            </div>
          )}

          {/* 다시 분석 버튼 */}
          <button
            onClick={handleAnalyze}
            className="mt-4 w-full py-2.5 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--text-muted)] hover:text-[#a855f7] hover:border-[#a855f7]/30 transition-colors"
          >
            다시 분석하기
          </button>
        </div>
      )}

      {/* 비구독자 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-[var(--border)]"
            style={{ backgroundColor: "#12121a" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5" style={{ background: "linear-gradient(90deg, #a855f7, #6366f1)" }} />
            <div className="p-6 text-center">
              <div
                className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.15))" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold mb-2">Ultra 구독자 전용 기능</h3>
              <p className="text-sm text-[var(--text-muted)] mb-5 leading-relaxed">
                AI 포트폴리오 분석은 Ultra 구독자에게만 제공됩니다.<br />
                구독하고 나만의 포트폴리오 맞춤 분석을 받아보세요.
              </p>
              <a
                href="/#subscribe"
                className="inline-flex items-center justify-center w-full py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #a855f7, #6366f1)",
                  color: "#fff",
                }}
              >
                Ultra 구독하기
              </a>
              <button
                onClick={() => setShowModal(false)}
                className="mt-3 w-full py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-white transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
