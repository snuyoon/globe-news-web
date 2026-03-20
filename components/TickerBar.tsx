"use client";

import { useEffect, useRef, useState } from "react";

interface TickerItem {
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
}

const FALLBACK_DATA: TickerItem[] = [
  { name: "S&P 500", value: "$583.21", change: "+0.72%", isPositive: true },
  { name: "NASDAQ", value: "$487.15", change: "+1.15%", isPositive: true },
  { name: "다우존스", value: "$428.50", change: "+0.31%", isPositive: true },
  { name: "비트코인", value: "$70,683", change: "+2.14%", isPositive: true },
  { name: "애플", value: "$248.96", change: "-0.39%", isPositive: false },
  { name: "엔비디아", value: "$117.70", change: "+1.82%", isPositive: true },
  { name: "테슬라", value: "$242.31", change: "-0.55%", isPositive: false },
  { name: "코스피", value: "2,612", change: "+0.45%", isPositive: true },
  { name: "코스닥", value: "738", change: "-0.32%", isPositive: false },
];

const FMP_KEY = "6Ywt9UETULQUTHdF5rVjI79uLaKjsnE0";
const FMP_BASE = "https://financialmodelingprep.com/stable/quote";
const FMP_SYMBOLS = [
  { fmp: "SPY", name: "S&P 500" },
  { fmp: "QQQ", name: "NASDAQ" },
  { fmp: "DIA", name: "다우존스" },
  { fmp: "BTCUSD", name: "비트코인" },
  { fmp: "AAPL", name: "애플" },
  { fmp: "NVDA", name: "엔비디아" },
  { fmp: "TSLA", name: "테슬라" },
  { fmp: "AMZN", name: "아마존" },
  { fmp: "GOOGL", name: "구글" },
  { fmp: "META", name: "메타" },
];

function fmt(val: number): string {
  if (Math.abs(val) >= 10000) return "$" + val.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return "$" + val.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export default function TickerBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tickers, setTickers] = useState<TickerItem[]>(FALLBACK_DATA);

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const promises = FMP_SYMBOLS.map((s) =>
          fetch(`${FMP_BASE}?symbol=${s.fmp}&apikey=${FMP_KEY}`)
            .then((r) => r.json())
            .then((d) => (Array.isArray(d) && d[0]) || null)
            .catch(() => null)
        );
        const results = await Promise.all(promises);

        const items: TickerItem[] = [];
        FMP_SYMBOLS.forEach((sym, i) => {
          const q = results[i];
          if (!q) return;
          const price = q.price as number;
          const changePct = q.changePercentage as number;
          items.push({
            name: sym.name,
            value: fmt(price),
            change: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`,
            isPositive: changePct >= 0,
          });
        });

        // 코스피/코스닥은 fallback 유지
        items.push(
          { name: "코스피", value: "2,612", change: "+0.45%", isPositive: true },
          { name: "코스닥", value: "738", change: "-0.32%", isPositive: false },
        );

        if (items.length > 0) setTickers(items);
      } catch { /* fallback 유지 */ }
    }

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animationId: number;
    let scrollPos = 0;
    const scroll = () => {
      scrollPos += 0.4;
      if (scrollPos >= el.scrollWidth / 2) scrollPos = 0;
      el.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(scroll);
    };
    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [tickers]);

  // 3번 반복으로 끊김 없는 무한 스크롤
  const items = [...tickers, ...tickers, ...tickers];

  return (
    <div className="bg-[#08080d] border-b border-[var(--border)] overflow-hidden">
      <div
        ref={scrollRef}
        className="flex items-center gap-8 px-4 py-1.5 overflow-hidden whitespace-nowrap"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <div key={`${item.name}-${i}`} className="flex items-center gap-2 shrink-0">
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
