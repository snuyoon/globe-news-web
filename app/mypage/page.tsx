"use client";

import { useState, useEffect, useCallback } from "react";
import Footer from "@/components/Footer";
import CardViewer from "@/components/CardViewer";
import CardArticle from "@/components/CardArticle";
import NewsDetailModal from "@/components/NewsDetailModal";
import { useAuth } from "@/components/AuthProvider";
import CancelWarningModal from "@/components/CancelWarningModal";
import Character from "@/components/Character";
import CharacterEditModal from "@/components/CharacterEditModal";
import { supabase, type CardNews, type News } from "@/lib/supabase";

const LEVELS = [
  { level: 1, name: "루키", minXp: 0, color: "#6b7280" },
  { level: 2, name: "트레이더", minXp: 100, color: "#22c55e" },
  { level: 3, name: "애널리스트", minXp: 300, color: "#3b82f6" },
  { level: 4, name: "매니저", minXp: 600, color: "#a855f7" },
  { level: 5, name: "디렉터", minXp: 1000, color: "#f0b90b" },
];

function getLevelInfo(xp: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXp) current = l;
  }
  const next = LEVELS.find((l) => l.minXp > xp);
  const progress = next
    ? ((xp - current.minXp) / (next.minXp - current.minXp)) * 100
    : 100;
  return { ...current, xp, nextXp: next?.minXp ?? current.minXp, progress, nextName: next?.name };
}

interface Profile {
  name: string | null;
  seat_number: number | null;
  character_data: Record<string, string> | null;
  xp: number;
  level: number;
  points: number;
  payment_status: string;
  is_lucky: boolean;
  created_at: string;
  topic_request: string | null;
}

type Tab = "cards" | "news";

export default function MyPage() {
  const { user, loading, isSubscriber } = useAuth();
  const [tab, setTab] = useState<Tab>("cards");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCharEdit, setShowCharEdit] = useState(false);
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

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("subscribers")
      .select("name, seat_number, character_data, xp, level, points, payment_status, is_lucky, created_at, topic_request")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setProfile(data as Profile);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchScraps();
      fetchProfile();
    }
  }, [user, fetchScraps, fetchProfile]);

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
      <main className="min-h-screen pt-20 px-4 flex flex-col items-center justify-center">
        <p className="text-lg font-bold mb-2">로그인이 필요합니다</p>
        <p className="text-sm text-[var(--text-muted)]">회원가입 후 스크랩한 콘텐츠를 모아볼 수 있어요</p>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen pt-20 pb-24 px-4 max-w-5xl mx-auto">
        {/* 프로필 카드 */}
        {profile && (() => {
          const lvl = getLevelInfo(profile.xp);
          const initial = (user?.user_metadata?.full_name || user?.email || "U")[0].toUpperCase();
          const joinDate = new Date(profile.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
          return (
            <div className="mb-8 rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--card)", border: `1px solid ${lvl.color}30` }}>
              <div className="h-1" style={{ background: `linear-gradient(to right, ${lvl.color}, ${lvl.color}80)` }} />
              <div className="p-5 md:p-6">
                <div className="flex items-start gap-4">
                  {/* 캐릭터 */}
                  <button onClick={() => setShowCharEdit(true)} className="flex-shrink-0 relative group" title="캐릭터 꾸미기">
                    {profile.character_data ? (
                      <Character
                        hoodieColor={profile.character_data.hoodieColor || "#2d2d3d"}
                        eyeStyle={(profile.character_data.eyeStyle as "dot") || "dot"}
                        hairStyle={(profile.character_data.hairStyle as "bangs") || "bangs"}
                        skinTone={(profile.character_data.skinTone as "#fce4c8") || "#fce4c8"}
                        accessory={(profile.character_data.accessory as "none") || "none"}
                        initial={profile.character_data.initial || initial}
                        size={64}
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                        style={{ backgroundColor: `${lvl.color}20`, color: lvl.color, border: `2px solid ${lvl.color}40` }}
                      >
                        {initial}
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-lg font-bold">{user?.user_metadata?.full_name || user?.email?.split("@")[0]}</h2>
                      {isSubscriber && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black">PRO</span>
                      )}
                      {profile.seat_number && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--bg)] text-[var(--text-muted)]">
                          좌석 #{profile.seat_number}
                        </span>
                      )}
                      {profile.is_lucky && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f0b90b]/20 text-[#f0b90b]">LUCKY</span>
                      )}
                    </div>

                    {/* 레벨 */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold" style={{ color: lvl.color }}>
                        Lv.{lvl.level} {lvl.name}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">{joinDate} 가입</span>
                    </div>

                    {/* XP 프로그레스 */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1">
                        <span>{profile.xp} XP</span>
                        {lvl.nextName && <span>다음: Lv.{lvl.level + 1} {lvl.nextName} ({lvl.nextXp} XP)</span>}
                        {!lvl.nextName && <span>MAX</span>}
                      </div>
                      <div className="h-2 rounded-full bg-[var(--bg)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${lvl.progress}%`, background: `linear-gradient(to right, ${lvl.color}, ${lvl.color}cc)` }}
                        />
                      </div>
                    </div>

                    {/* 포인트 + 구독 관리 */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">포인트: <strong className="text-[#f0b90b]">{profile.points}P</strong></span>
                      {isSubscriber && (
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="text-[var(--text-muted)] hover:text-[#ef4444] transition-colors text-[11px]"
                        >
                          구독 해지
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 스크랩 헤더 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-1">내 스크랩</h2>
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

      {/* 캐릭터 편집 모달 */}
      {showCharEdit && user && (
        <CharacterEditModal
          userId={user.id}
          current={profile?.character_data || null}
          onClose={() => setShowCharEdit(false)}
          onSaved={() => fetchProfile()}
        />
      )}

      {/* 해지 경고 모달 */}
      {showCancelModal && profile && (() => {
        const lvl = getLevelInfo(profile.xp);
        return (
          <CancelWarningModal
            level={lvl.level}
            levelName={lvl.name}
            points={profile.points}
            isFounder={!!profile.seat_number && profile.seat_number <= 100}
            onClose={() => setShowCancelModal(false)}
            onConfirm={() => {
              setShowCancelModal(false);
              // TODO: 실제 해지 로직 (결제 시스템 연동 후)
              alert("해지 기능은 결제 시스템 연동 후 활성화됩니다.");
            }}
          />
        );
      })()}

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
