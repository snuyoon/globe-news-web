"use client";

import { useEffect, useRef, useState } from "react";

interface TickerItem {
  symbol: string;
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const FALLBACK_DATA: TickerItem[] = [
  { symbol: "SPY", name: "S&P 500", value: "$583.21", change: "+0.72%", isPositive: true },
  { symbol: "QQQ", name: "NASDAQ", value: "$487.15", change: "+1.15%", isPositive: true },
  { symbol: "DIA", name: "다우존스", value: "$428.50", change: "+0.31%", isPositive: true },
  { symbol: "AAPL", name: "애플", value: "$248.96", change: "-0.39%", isPositive: false },
  { symbol: "NVDA", name: "엔비디아", value: "$117.70", change: "+1.82%", isPositive: true },
  { symbol: "TSLA", name: "테슬라", value: "$242.31", change: "-0.55%", isPositive: false },
];

const FMP_KEY = "6Ywt9UETULQUTHdF5rVjI79uLaKjsnE0";
const FMP_BASE = "https://financialmodelingprep.com/stable/quote";
const SYMBOLS = [
  { fmp: "SPY", name: "S&P 500" },
  { fmp: "QQQ", name: "NASDAQ" },
  { fmp: "DIA", name: "다우존스" },
  { fmp: "AAPL", name: "애플" },
  { fmp: "NVDA", name: "엔비디아" },
  { fmp: "TSLA", name: "테슬라" },
];

function formatNumber(val: number, prefix = ""): string {
  if (Math.abs(val) >= 10000) return prefix + val.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (Math.abs(val) >= 100) return prefix + val.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return prefix + val.toFixed(2);
}

export default function TickerBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tickers, setTickers] = useState<TickerItem[]>(FALLBACK_DATA);

  // FMP API에서 실시간 데이터 가져오기
  useEffect(() => {
    async function fetchQuotes() {
      try {
        // stable 엔드포인트는 한 개씩 조회 → 병렬 호출
        const promises = SYMBOLS.map((s) =>
          fetch(`${FMP_BASE}?symbol=${s.fmp}&apikey=${FMP_KEY}`)
            .then((r) => r.json())
            .then((d) => (Array.isArray(d) && d[0]) || null)
            .catch(() => null)
        );
        const results = await Promise.all(promises);
        const data = results.filter(Boolean);

        const items: TickerItem[] = SYMBOLS.map((sym) => {
          const q = data.find((d: Record<string, unknown>) => d.symbol === sym.fmp);
          if (!q) return { symbol: sym.fmp, name: sym.name, value: "—", change: "—", isPositive: true };

          const price = q.price as number;
          const changePct = q.changePercentage as number;
          const isPos = changePct >= 0;

          const valStr = sym.fmp.startsWith("BTC") ? "$" + formatNumber(price) : formatNumber(price, "$");

          return {
            symbol: sym.fmp,
            name: sym.name,
            value: valStr,
            change: `${isPos ? "+" : ""}${changePct.toFixed(2)}%`,
            isPositive: isPos,
          };
        });

        setTickers(items);
      } catch {
        // 실패 시 fallback 유지
      }
    }

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60_000); // 1분마다 갱신
    return () => clearInterval(interval);
  }, []);

  // 자동 스크롤
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let scrollPos = 0;

    const scroll = () => {
      scrollPos += 0.5;
      if (scrollPos >= el.scrollWidth / 2) scrollPos = 0;
      el.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [tickers]);

  const items = [...tickers, ...tickers]; // 무한 스크롤용 복제

  return (
    <div className="bg-[#08080d] border-b border-[var(--border)] overflow-hidden">
      <div
        ref={scrollRef}
        className="flex items-center gap-6 px-4 py-1.5 overflow-hidden whitespace-nowrap"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <div key={`${item.symbol}-${i}`} className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[var(--text-muted)] font-medium">{item.name}</span>
            <span className="text-[11px] text-[var(--text)] font-semibold">{item.value}</span>
            <span className={`text-[11px] font-semibold ${item.isPositive ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
