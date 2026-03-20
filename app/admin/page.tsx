"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase, type News } from "@/lib/supabase";

/* ── 타입 ── */
interface Subscriber {
  id: number;
  user_id: string;
  name: string;
  email: string;
  seat_number: number;
  is_lucky: boolean;
  topic_request: string | null;
  created_at: string;
  character_data: { initial?: string } | null;
}

/* ── 유틸 ── */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const masked = local.length <= 2 ? local : local[0] + "*".repeat(local.length - 2) + local[local.length - 1];
  return `${masked}@${domain}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [todayNewsCount, setTodayNewsCount] = useState(0);
  const [recentNews, setRecentNews] = useState<News[]>([]);
  const [expandedNewsId, setExpandedNewsId] = useState<number | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const loadData = useCallback(async () => {
    setDataLoading(true);

    // 구독자 목록
    const { data: subs } = await supabase
      .from("subscribers")
      .select("id, user_id, name, email, seat_number, is_lucky, topic_request, created_at, character_data")
      .order("seat_number", { ascending: true });

    if (subs) setSubscribers(subs as Subscriber[]);

    // 오늘 뉴스 수
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const { count } = await supabase
      .from("news")
      .select("id", { count: "exact", head: true })
      .gte("published_at", `${todayStr}T00:00:00`);

    setTodayNewsCount(count ?? 0);

    // 최근 뉴스 10개
    const { data: newsData } = await supabase
      .from("news")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(10);

    if (newsData) setRecentNews(newsData as News[]);

    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadData();
    }
  }, [authLoading, isAdmin, loadData]);

  /* ── 비관리자 차단 ── */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)] animate-pulse">로딩 중...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-bold text-[var(--red)]">권한이 없습니다</p>
        <p className="text-sm text-[var(--text-muted)]">관리자만 접근할 수 있는 페이지입니다.</p>
        <a
          href="/"
          className="mt-4 px-6 py-2 rounded-lg bg-[var(--card)] hover:bg-[var(--card-hover)] text-sm font-medium text-[var(--text-muted)] hover:text-white transition-all border border-[var(--border)]"
        >
          홈으로 돌아가기
        </a>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)] animate-pulse">데이터 불러오는 중...</p>
      </div>
    );
  }

  /* ── 파생 데이터 ── */
  const luckyWinners = subscribers.filter((s) => s.is_lucky);
  const topicRequests = subscribers.filter((s) => s.topic_request);

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-4 pt-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
            관리자{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
              대시보드
            </span>
          </h1>
          <p className="text-sm text-[var(--text-muted)]">US속보 운영 현황</p>
        </div>

        {/* ════════ 상단 통계 카드 ════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* 구독자 수 */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs text-[var(--text-muted)] font-medium mb-1">현재 구독자</p>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
              {subscribers.length}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">/ 100 좌석</p>
          </div>

          {/* 오늘 뉴스 */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs text-[var(--text-muted)] font-medium mb-1">오늘 뉴스</p>
            <p className="text-3xl font-black text-[var(--text)]">{todayNewsCount}</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">건</p>
          </div>

          {/* 럭키넘버 당첨자 */}
          <div className="rounded-xl border border-[#f0b90b]/30 bg-gradient-to-b from-[#f0b90b]/5 to-[var(--card)] p-5">
            <p className="text-xs text-[var(--text-muted)] font-medium mb-1">럭키넘버 당첨</p>
            <p className="text-3xl font-black text-[#f0b90b]">{luckyWinners.length}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {luckyWinners.map((w) => (
                <span key={w.id} className="text-[10px] px-1.5 py-0.5 rounded bg-[#f0b90b]/10 text-[#f0b90b] font-semibold">
                  #{w.seat_number} {w.character_data?.initial || w.name?.[0] || "?"}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ════════ 구독자 목록 ════════ */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">구독자 목록</h2>
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[var(--card)] text-[var(--text-muted)]">
                  <th className="px-4 py-3 text-xs font-semibold">#</th>
                  <th className="px-4 py-3 text-xs font-semibold">이니셜</th>
                  <th className="px-4 py-3 text-xs font-semibold">이름</th>
                  <th className="px-4 py-3 text-xs font-semibold">이메일</th>
                  <th className="px-4 py-3 text-xs font-semibold">좌석</th>
                  <th className="px-4 py-3 text-xs font-semibold">럭키</th>
                  <th className="px-4 py-3 text-xs font-semibold">주제신청</th>
                  <th className="px-4 py-3 text-xs font-semibold">가입일</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub, i) => (
                  <tr
                    key={sub.id}
                    className={`border-t border-[var(--border)] transition-colors ${
                      sub.topic_request
                        ? "bg-[#f0b90b]/[0.04] hover:bg-[#f0b90b]/[0.08]"
                        : "hover:bg-[var(--card)]"
                    }`}
                  >
                    <td className="px-4 py-3 text-[var(--text-muted)]">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#f0b90b]/10 text-[#f0b90b] text-xs font-bold">
                        {sub.character_data?.initial || sub.name?.[0] || "?"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{sub.name || "-"}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">{maskEmail(sub.email)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{sub.seat_number}</td>
                    <td className="px-4 py-3">
                      {sub.is_lucky ? (
                        <span className="text-[#f0b90b] font-bold text-xs">당첨</span>
                      ) : (
                        <span className="text-[var(--text-muted)] opacity-30">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[200px] truncate">
                      {sub.topic_request ? (
                        <span className="text-[#f0b90b] font-medium">{sub.topic_request}</span>
                      ) : (
                        <span className="text-[var(--text-muted)] opacity-30">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">{formatDate(sub.created_at)}</td>
                  </tr>
                ))}
                {subscribers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-muted)]">
                      아직 구독자가 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ════════ 주제 신청 모아보기 ════════ */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">
            주제 신청 모아보기
            <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">({topicRequests.length}건)</span>
          </h2>

          {topicRequests.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--text-muted)]">
              아직 주제 신청이 없습니다
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topicRequests.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-xl border border-[#f0b90b]/20 bg-[#f0b90b]/[0.03] p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0b90b]/10 text-[#f0b90b] text-[10px] font-bold">
                      {sub.character_data?.initial || sub.name?.[0] || "?"}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{sub.name} (#{sub.seat_number})</span>
                  </div>
                  <p className="text-sm font-medium text-[#f0b90b]">{sub.topic_request}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ════════ 최근 뉴스 ════════ */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">최근 뉴스 (web_detail 확인)</h2>
          <div className="space-y-2">
            {recentNews.map((news) => {
              const isExpanded = expandedNewsId === news.id;
              const lines = news.korean_text.split("\n").filter((l) => l.trim());
              const headline = lines[0]
                ?.replace(/^[\u2605\u2606]{1,5}\s*/, "")
                .replace(/^[\[【].*?[\]】]\s*/, "") || "(제목 없음)";

              return (
                <div key={news.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                  <button
                    onClick={() => setExpandedNewsId(isExpanded ? null : news.id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[var(--card-hover)] transition-colors"
                  >
                    <span className="shrink-0 text-base">
                      {news.web_detail ? "\u2705" : "\u274C"}
                    </span>
                    <span className="flex-1 text-sm font-medium truncate">{headline}</span>
                    <span className="shrink-0 text-xs text-[var(--text-muted)]">
                      {formatDate(news.published_at)}
                    </span>
                    <svg
                      className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-[var(--border)]">
                      {news.web_detail ? (
                        <div className="mt-3">
                          <p className="text-xs font-bold text-[var(--accent)] mb-2">web_detail:</p>
                          <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                            {news.web_detail}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-[var(--text-muted)] opacity-50">
                          web_detail 없음
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
