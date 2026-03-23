"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthProvider";

const TOP_TICKERS = [
  "AAPL", "TSLA", "NVDA", "MSFT", "GOOGL",
  "AMZN", "META", "AMD", "NFLX", "JPM",
  "V", "MA", "DIS", "BA", "INTC",
  "CRM", "PYPL", "UBER", "COIN", "PLTR",
];

const MAX_TICKERS = 10;

export default function PortfolioSettings() {
  const { user } = useAuth();
  const [tickers, setTickers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const sugRef = useRef<HTMLDivElement>(null);

  // 포트폴리오 로드
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bjdlyjeltwjukuthxkti.supabase.co"}/functions/v1/portfolio`)
      .then((r) => r.json())
      .then((data) => {
        if (data.tickers) setTickers(data.tickers);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  // 자동완성 필터
  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }
    const q = input.toUpperCase();
    const filtered = TOP_TICKERS.filter(
      (t) => t.startsWith(q) && !tickers.includes(t)
    );
    setSuggestions(filtered.slice(0, 5));
  }, [input, tickers]);

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sugRef.current && !sugRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addTicker = useCallback(
    (ticker: string) => {
      const t = ticker.toUpperCase().trim();
      if (!t || tickers.includes(t) || tickers.length >= MAX_TICKERS) return;
      setTickers((prev) => [...prev, t]);
      setInput("");
      setSuggestions([]);
      setSaved(false);
      inputRef.current?.focus();
    },
    [tickers]
  );

  const removeTicker = useCallback((ticker: string) => {
    setTickers((prev) => prev.filter((t) => t !== ticker));
    setSaved(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        addTicker(suggestions[0]);
      } else if (input.trim()) {
        addTicker(input);
      }
    }
    if (e.key === "Backspace" && !input && tickers.length > 0) {
      removeTicker(tickers[tickers.length - 1]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bjdlyjeltwjukuthxkti.supabase.co"}/functions/v1/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers }),
      });
      if (!res.ok) throw new Error("저장 실패");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("포트폴리오 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-xl p-5 border border-[var(--border)]" style={{ backgroundColor: "var(--card)" }}>
        <h3 className="text-base font-bold mb-2">내 포트폴리오 설정</h3>
        <p className="text-sm text-[var(--text-muted)]">로그인 후 보유 종목을 등록하면 관련 뉴스에서 AI 분석을 받을 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden" style={{ backgroundColor: "var(--card)" }}>
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128188;</span>
          <h3 className="text-base font-bold">내 포트폴리오</h3>
          <span className="text-[11px] text-[var(--text-muted)] ml-auto">
            {tickers.length}/{MAX_TICKERS}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          보유 종목을 등록하면 뉴스별 AI 포트폴리오 영향 분석을 받을 수 있습니다
        </p>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <div className="w-4 h-4 border-2 border-[#f0b90b] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--text-muted)]">포트폴리오 로딩 중...</span>
          </div>
        ) : (
          <>
            {/* 태그 입력 영역 */}
            <div
              className="flex flex-wrap items-center gap-2 min-h-[44px] px-3 py-2 rounded-xl border border-[var(--border)] focus-within:border-[#f0b90b]/50 transition-colors"
              style={{ backgroundColor: "var(--bg)" }}
              onClick={() => inputRef.current?.focus()}
            >
              {tickers.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: "rgba(240,185,11,0.1)", color: "#f0b90b" }}
                >
                  ${t}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTicker(t);
                    }}
                    className="ml-0.5 text-[#f0b90b]/50 hover:text-[#f0b90b] transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              ))}
              {tickers.length < MAX_TICKERS && (
                <div className="relative flex-1 min-w-[100px]" ref={sugRef}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value.toUpperCase())}
                    onKeyDown={handleKeyDown}
                    placeholder={tickers.length === 0 ? "티커 입력 (예: AAPL)" : "추가..."}
                    className="w-full bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/40 outline-none py-0.5"
                    maxLength={10}
                  />
                  {/* 자동완성 드롭다운 */}
                  {suggestions.length > 0 && (
                    <div
                      className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-[var(--border)] overflow-hidden z-50 shadow-xl"
                      style={{ backgroundColor: "var(--card)" }}
                    >
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => addTicker(s)}
                          className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-[var(--bg)] transition-colors flex items-center gap-2"
                        >
                          <span style={{ color: "#f0b90b" }}>${s}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 인기 종목 추천 */}
            {tickers.length < MAX_TICKERS && (
              <div className="mt-3">
                <span className="text-[11px] text-[var(--text-muted)] mb-1.5 block">인기 종목</span>
                <div className="flex flex-wrap gap-1.5">
                  {TOP_TICKERS.filter((t) => !tickers.includes(t))
                    .slice(0, 8)
                    .map((t) => (
                      <button
                        key={t}
                        onClick={() => addTicker(t)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[#f0b90b] hover:border-[#f0b90b]/30 transition-colors"
                      >
                        +{t}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
                <p className="text-xs text-[#ef4444]">{error}</p>
              </div>
            )}

            {/* 저장 버튼 */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
              {saved && (
                <span className="text-sm text-[#22c55e] font-medium animate-pulse">
                  저장 완료
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
