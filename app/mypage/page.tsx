"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CardViewer from "@/components/CardViewer";
import CardArticle from "@/components/CardArticle";
import NewsDetailModal from "@/components/NewsDetailModal";
import { useAuth } from "@/components/AuthProvider";
import { supabase, type CardNews, type News } from "@/lib/supabase";

type Tab = "cards" | "news";

export default function MyPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("cards");
  const [scrapCards, setScrapCards] = useState<CardNews[]>([]);
  const [scrapNews, setScrapNews] = useState<News[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [viewerCard, setViewerCard] = useState<CardNews | null>(null);
  const [articleCard, setArticleCard] = useState<CardNews | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  const fetchScraps = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);

    // 카드뉴스 스크랩
    const { data: cardScrapRows } = await supabase
      .from("card_scraps")
      .select("card_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (cardScrapRows && cardScrapRows.length > 0) {
      const ids = cardScrapRows.map((r) => r.card_id);
      const { data: cards } = await supabase
        .from("card_news")
        .select("id,type,date,title,slide_count,base_url,created_at,cover_image")
        .in("id", ids);
      // 스크랩 순서 유지
      if (cards) {
        const cardMap = new Map(cards.map((c) => [c.id, c]));
        setScrapCards(ids.map((id) => cardMap.get(id)).filter(Boolean) as CardNews[]);
      }
    } else {
      setScrapCards([]);
    }

    // 뉴스 스크랩
    const { data: newsScrapRows } = await supabase
      .from("news_scraps")
      .select("news_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (newsScrapRows && newsScrapRows.length > 0) {
      const ids = newsScrapRows.map((r) => r.news_id);
      const { data: news } = await supabase
        .from("news")
        .select("*")
        .in("id", ids);
      if (news) {
        const newsMap = new Map(news.map((n) => [n.id, n]));
        setScrapNews(ids.map((id) => newsMap.get(id)).filter(Boolean) as News[]);
      }
    } else {
      setScrapNews([]);
    }

    setLoadingData(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchScraps();
  }, [user, fetchScraps]);

  const openCard = useCallback(async (card: CardNews) => {
    const { data } = await supabase.from("card_news").select("*").eq("id", card.id).single();
    if (data?.sample_json) setArticleCard(data as CardNews);
    else setViewerCard(card);
  }, []);

  const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    premarket: { label: "장전 브리핑", color: "#3b82f6" },
    morning: { label: "모닝 브리핑", color: "#22c55e" },
    weekend: { label: "주말 특별판", color: "#a855f7" },
    company: { label: "기업분석", color: "#f97316" },
  };

  if (loading) return null;

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 px-4 flex flex-col items-center justify-center">
          <p className="text-lg font-bold mb-2">로그인이 필요합니다</p>
          <p className="text-sm text-[var(--text-muted)]">회원가입 후 스크랩한 콘텐츠를 모아볼 수 있어요</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-24 px-4 max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1">내 스크랩</h1>
          <p className="text-sm text-[var(--text-muted)]">저장한 콘텐츠를 모아봅니다</p>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "cards" as Tab, label: "카드뉴스", count: scrapCards.length },
            { key: "news" as Tab, label: "뉴스", count: scrapNews.length },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-[#f0b90b]/20 text-[#f0b90b] border border-[#f0b90b]/30"
                  : "bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)] hover:text-white"
              }`}
            >
              {t.label} {t.count > 0 && <span className="ml-1 text-xs opacity-70">({t.count})</span>}
            </button>
          ))}
        </div>

        {loadingData ? (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <div className="w-6 h-6 border-2 border-[#f0b90b] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">불러오는 중...</p>
          </div>
        ) : tab === "cards" ? (
          /* 카드뉴스 스크랩 */
          scrapCards.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {scrapCards.map((card) => {
                const typeInfo = TYPE_LABELS[card.type] || { label: card.type, color: "#6b7280" };
                const coverSrc = card.cover_image || `${card.base_url}/slide_1.png`;
                return (
                  <button
                    key={card.id}
                    onClick={() => openCard(card)}
                    className="group text-left rounded-xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg"
                    style={{ backgroundColor: "var(--card)" }}
                  >
                    <div className="relative aspect-[1.2/1] overflow-hidden bg-black/20">
                      <img
                        src={coverSrc}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                        {card.slide_count}장
                      </span>
                      <span
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-white text-xs font-medium"
                        style={{ backgroundColor: `${typeInfo.color}cc` }}
                      >
                        {typeInfo.label}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-[var(--text-muted)] mb-1">{card.date}</p>
                      <h3 className="text-sm font-bold group-hover:text-[#f0b90b] transition-colors line-clamp-2">
                        {card.title}
                      </h3>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <p className="text-3xl mb-3">&#x1F516;</p>
              <p className="text-sm font-medium mb-2">스크랩한 카드뉴스가 없습니다</p>
              <a href="/cardnews" className="text-xs text-[#f0b90b] hover:underline">카드뉴스 보러가기</a>
            </div>
          )
        ) : (
          /* 뉴스 스크랩 */
          scrapNews.length > 0 ? (
            <div className="flex flex-col gap-3">
              {scrapNews.map((news) => {
                const text = news.korean_text.replace(/^[\u2605\u2606]{1,5}\s*/, "").replace(/^[\[【].*?[\]】]\s*/, "");
                const headline = text.split("\n").filter((l) => l.trim())[0] || "";
                return (
                  <button
                    key={news.id}
                    onClick={() => setSelectedNews(news)}
                    className="text-left p-4 rounded-xl transition-all hover:scale-[1.01] hover:shadow-lg flex gap-4"
                    style={{ backgroundColor: "var(--card)" }}
                  >
                    {news.og_image && (
                      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-black/20">
                        <img src={news.og_image} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {news.theme && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--bg)] text-[var(--text-muted)]">
                            {news.theme}
                          </span>
                        )}
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {"★".repeat(news.importance)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold line-clamp-2 mb-1">{headline}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                        {news.source && <span>{news.source}</span>}
                        <span>{new Date(news.published_at).toLocaleDateString("ko-KR")}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <p className="text-3xl mb-3">&#x1F4F0;</p>
              <p className="text-sm font-medium mb-2">스크랩한 뉴스가 없습니다</p>
              <a href="/news" className="text-xs text-[#f0b90b] hover:underline">뉴스 보러가기</a>
            </div>
          )
        )}
      </main>
      <Footer />

      {/* 카드뉴스 뷰어 */}
      {viewerCard && (
        <CardViewer
          title={viewerCard.title}
          slideCount={viewerCard.slide_count}
          baseUrl={viewerCard.base_url}
          onClose={() => setViewerCard(null)}
        />
      )}
      {articleCard && <CardArticle card={articleCard} onClose={() => setArticleCard(null)} />}
      {selectedNews && <NewsDetailModal news={selectedNews} onClose={() => setSelectedNews(null)} />}
    </>
  );
}
