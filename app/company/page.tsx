import Footer from "@/components/Footer";

const COMPANIES = [
  { ticker: "TSLA", name: "테슬라", icon: "🚗", color: "#ef4444" },
  { ticker: "AAPL", name: "애플", icon: "🍎", color: "#6b7280" },
  { ticker: "NVDA", name: "엔비디아", icon: "🟢", color: "#22c55e" },
  { ticker: "MSFT", name: "마이크로소프트", icon: "🪟", color: "#3b82f6" },
  { ticker: "AMZN", name: "아마존", icon: "📦", color: "#f97316" },
  { ticker: "GOOGL", name: "구글", icon: "🔍", color: "#eab308" },
  { ticker: "META", name: "메타", icon: "👓", color: "#3b82f6" },
  { ticker: "MU", name: "마이크론", icon: "💾", color: "#8b5cf6" },
];

export default function CompanyPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
          기업{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
            뉴스
          </span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm mb-8">
          주요 기업별 뉴스와 분석 카드뉴스 · 준비 중
        </p>

        {/* 기업 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {COMPANIES.map((c) => (
            <div
              key={c.ticker}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-center opacity-60 cursor-not-allowed hover:opacity-80 transition-opacity"
            >
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="font-bold text-sm mb-0.5">{c.name}</div>
              <div className="text-xs text-[var(--text-muted)]">${c.ticker}</div>
            </div>
          ))}
        </div>

        {/* Coming soon */}
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="text-xl font-bold mb-2">준비 중입니다</h2>
          <p className="text-[var(--text-muted)] text-sm mb-4">
            주요 기업별 심층 분석 카드뉴스가 곧 찾아옵니다
          </p>
          <p className="text-[var(--text-muted)] text-xs">
            매주 주말 특별판에서 기업 분석을 먼저 만나보세요
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
