"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import CardViewer from "@/components/CardViewer";

const COMPANIES = [
  { ticker: "TSLA", name: "테슬라", domain: "tesla.com", color: "#ef4444", cardCount: 1 },
  { ticker: "AAPL", name: "애플", domain: "apple.com", color: "#6b7280", cardCount: 0 },
  { ticker: "NVDA", name: "엔비디아", domain: "nvidia.com", color: "#76b900", cardCount: 0 },
  { ticker: "MSFT", name: "마이크로소프트", domain: "microsoft.com", color: "#00a4ef", cardCount: 0 },
  { ticker: "AMZN", name: "아마존", domain: "amazon.com", color: "#ff9900", cardCount: 0 },
  { ticker: "GOOGL", name: "구글", domain: "google.com", color: "#4285f4", cardCount: 0 },
  { ticker: "META", name: "메타", domain: "meta.com", color: "#1877f2", cardCount: 0 },
  { ticker: "MU", name: "마이크론", domain: "micron.com", color: "#00b4d8", cardCount: 0 },
];

const CARD_NEWS_DATA: Record<string, { title: string; baseUrl: string; slideCount: number }[]> = {
  TSLA: [
    {
      title: "테슬라 심층 분석 카드뉴스",
      baseUrl: "https://bjdlyjeltwjukuthxkti.supabase.co/storage/v1/object/public/card-images/archive/company-tesla",
      slideCount: 10,
    },
  ],
};

export default function CompanyPage() {
  const { isSubscriber, isAdmin } = useAuth();
  const canView = isSubscriber || isAdmin;
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [viewerData, setViewerData] = useState<{ title: string; baseUrl: string; slideCount: number } | null>(null);
  const [showVipModal, setShowVipModal] = useState(false);

  const handleCompanyClick = (ticker: string, cardCount: number) => {
    if (!canView) {
      setShowVipModal(true);
      return;
    }
    if (cardCount === 0) return;
    setSelectedCompany(selectedCompany === ticker ? null : ticker);
  };

  const handleCardNewsClick = (data: { title: string; baseUrl: string; slideCount: number }) => {
    setViewerData(data);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
          기업{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
            뉴스
          </span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm mb-8">
          주요 기업별 심층 분석 카드뉴스
        </p>

        {/* Company Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {COMPANIES.map((c) => {
            const isActive = c.cardCount > 0;
            const isSelected = selectedCompany === c.ticker;

            return (
              <button
                key={c.ticker}
                onClick={() => handleCompanyClick(c.ticker, c.cardCount)}
                className={`relative overflow-hidden bg-[var(--card)] border rounded-xl p-5 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-[#f0b90b] shadow-[0_0_20px_rgba(240,185,11,0.15)]"
                    : isActive
                    ? "border-[var(--border)] hover:border-[color:var(--accent,#f0b90b)] hover:shadow-lg cursor-pointer"
                    : "border-[var(--border)] opacity-60 cursor-default"
                }`}
              >
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: c.color }}
                />

                <div className="flex items-start gap-3 mb-3">
                  {/* Company Logo */}
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://logo.clearbit.com/${c.domain}`}
                      alt={`${c.name} logo`}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">{c.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">${c.ticker}</div>
                  </div>
                </div>

                {/* Card count & CTA */}
                <div className="flex items-center justify-between">
                  {isActive ? (
                    <>
                      <span className="text-xs text-[var(--text-muted)]">
                        카드뉴스 {c.cardCount}개
                      </span>
                      <span className="text-xs font-semibold" style={{ color: c.color }}>
                        분석 보기 &rarr;
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)]">
                      준비 중
                    </span>
                  )}
                </div>

                {/* VIP badge for non-subscribers */}
                {!canView && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black">
                      VIP
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Company Detail */}
        {selectedCompany && canView && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-2 duration-300">
            {(() => {
              const company = COMPANIES.find((c) => c.ticker === selectedCompany);
              const cardNewsList = CARD_NEWS_DATA[selectedCompany];
              if (!company || !cardNewsList) return null;

              return (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://logo.clearbit.com/${company.domain}`}
                        alt={`${company.name} logo`}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">{company.name} 카드뉴스</h2>
                      <p className="text-xs text-[var(--text-muted)]">${company.ticker} 심층 분석</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cardNewsList.map((cardNews, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCardNewsClick(cardNews)}
                        className="group relative overflow-hidden rounded-lg border border-[var(--border)] hover:border-[#f0b90b] transition-all duration-200 hover:shadow-lg"
                      >
                        {/* Thumbnail preview */}
                        <div className="aspect-[16/9] bg-gradient-to-br from-[var(--card)] to-[var(--background)] flex items-center justify-center overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`${cardNews.baseUrl}/slide_1.png`}
                            alt={cardNews.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3 text-left">
                          <div className="font-semibold text-sm mb-1">{cardNews.title}</div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {cardNews.slideCount}장 슬라이드
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <Footer />

      {/* CardViewer Modal */}
      {viewerData && (
        <CardViewer
          title={viewerData.title}
          baseUrl={viewerData.baseUrl}
          slideCount={viewerData.slideCount}
          onClose={() => setViewerData(null)}
        />
      )}

      {/* VIP Modal */}
      {showVipModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowVipModal(false)}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#f0b90b] to-[#ef6d09] flex items-center justify-center">
              <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">VIP 전용 콘텐츠</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              기업 분석 카드뉴스는 구독자 전용 콘텐츠입니다.
              <br />
              구독하고 심층 분석을 만나보세요.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowVipModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-[var(--border)] hover:bg-[var(--border)] transition-colors"
              >
                닫기
              </button>
              <a
                href="/#subscribe"
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black hover:opacity-90 transition-opacity text-center"
              >
                구독하기
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
