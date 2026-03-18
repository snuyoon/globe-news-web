import NewsFeed from "@/components/NewsFeed";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="border-b border-[var(--border)] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              글로벌 금융 속보
            </h1>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
              AI가 선별한 실시간 글로벌 금융 뉴스
            </p>
          </div>
          <a
            href="https://x.com/US_sokbo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[var(--accent)] hover:underline"
          >
            @US_sokbo
          </a>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-2xl mx-auto">
        <NewsFeed />
      </main>

      {/* 푸터 */}
      <footer className="border-t border-[var(--border)] mt-8 py-6 text-center text-[11px] text-[var(--text-muted)]">
        <p>
          본 서비스는 AI가 자동으로 수집/번역한 뉴스를 제공하며, 투자 조언이
          아닙니다.
        </p>
        <p className="mt-1">
          뉴스 출처: Benzinga, CNBC, Google News, Finnhub
        </p>
      </footer>
    </div>
  );
}
