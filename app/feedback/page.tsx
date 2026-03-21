"use client";

import { useState, useEffect, useCallback } from "react";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { grantXp } from "@/lib/xp";
import { timeAgo } from "@/lib/utils";

interface Feedback {
  id: number;
  user_id: string;
  category: string;
  body: string;
  status: string;
  admin_reply: string | null;
  created_at: string;
}

const CATEGORIES = [
  { value: "bug", label: "버그 제보" },
  { value: "feature", label: "기능 제안" },
  { value: "content", label: "콘텐츠 요청" },
  { value: "general", label: "기타 의견" },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "검토 중", color: "#f0b90b" },
  accepted: { label: "채택", color: "#22c55e" },
  resolved: { label: "해결됨", color: "#3b82f6" },
  rejected: { label: "반려", color: "#6b7280" },
};

export default function FeedbackPage() {
  const { user, loading, isSubscriber, isAdmin } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("general");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"mine" | "all">("mine");

  const canWrite = isSubscriber || isAdmin;

  const fetchFeedbacks = useCallback(async () => {
    setLoadingData(true);
    let query = supabase.from("feedback").select("*").order("created_at", { ascending: false }).limit(50);
    if (filter === "mine" && user) {
      query = query.eq("user_id", user.id);
    }
    const { data } = await query;
    setFeedbacks(data || []);
    setLoadingData(false);
  }, [user, filter]);

  useEffect(() => {
    if (user) fetchFeedbacks();
  }, [user, fetchFeedbacks]);

  const handleSubmit = async () => {
    if (!user || !body.trim() || submitting) return;
    setSubmitting(true);
    await supabase.from("feedback").insert({ user_id: user.id, category, body: body.trim() });

    // XP 보상은 채택 시에만 (admin이 처리)
    setBody("");
    setCategory("general");
    setShowForm(false);
    setSubmitting(false);
    fetchFeedbacks();
  };

  // 관리자: 상태 변경
  const updateStatus = async (id: number, status: string) => {
    await supabase.from("feedback").update({ status, resolved_at: status === "resolved" ? new Date().toISOString() : null }).eq("id", id);
    // 채택 시 XP 보상
    if (status === "accepted") {
      const fb = feedbacks.find((f) => f.id === id);
      if (fb) grantXp(fb.user_id, "feedback_accepted");
    }
    fetchFeedbacks();
  };

  // 관리자: 답변
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleReply = async (id: number) => {
    if (!replyText.trim()) return;
    await supabase.from("feedback").update({ admin_reply: replyText.trim() }).eq("id", id);
    setReplyId(null);
    setReplyText("");
    fetchFeedbacks();
  };

  if (loading) return null;

  return (
    <>
      <main className="min-h-screen pt-20 pb-24 px-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold mb-1">피드백</h1>
            <p className="text-sm text-[var(--text-muted)]">서비스 개선에 참여하세요. 채택되면 XP+20, 포인트+30!</p>
          </div>
          {canWrite && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 rounded-lg text-sm font-bold text-black bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] hover:opacity-90 transition-opacity"
            >
              {showForm ? "취소" : "의견 보내기"}
            </button>
          )}
        </div>

        {!canWrite && !loading && (
          <div className="mb-6 p-4 rounded-xl bg-[#f0b90b]/5 border border-[#f0b90b]/15 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              {!user ? "로그인 후 피드백을 보낼 수 있어요" : "구독자만 피드백을 보낼 수 있어요"}
            </p>
          </div>
        )}

        {/* 작성 폼 */}
        {showForm && (
          <div className="mb-6 p-5 rounded-xl" style={{ backgroundColor: "var(--card)" }}>
            <div className="flex gap-2 mb-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                    category === c.value
                      ? "bg-[#f0b90b]/20 text-[#f0b90b] border border-[#f0b90b]/30"
                      : "bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="어떤 점이 불편하셨나요? 어떤 기능이 있으면 좋겠나요?"
              rows={4}
              className="w-full bg-transparent text-sm text-[var(--text-muted)] outline-none resize-none placeholder:text-[var(--text-muted)]/50 border border-[var(--border)] rounded-lg p-3 focus:border-[#f0b90b] transition-colors"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleSubmit}
                disabled={!body.trim() || submitting}
                className="px-5 py-2 rounded-lg text-sm font-bold text-black bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {submitting ? "전송 중..." : "보내기"}
              </button>
            </div>
          </div>
        )}

        {/* 필터 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter("mine")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${filter === "mine" ? "bg-[#f0b90b]/20 text-[#f0b90b]" : "text-[var(--text-muted)]"}`}
          >
            내 피드백
          </button>
          {isAdmin && (
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${filter === "all" ? "bg-[#f0b90b]/20 text-[#f0b90b]" : "text-[var(--text-muted)]"}`}
            >
              전체 (관리자)
            </button>
          )}
        </div>

        {/* 피드백 목록 */}
        {loadingData ? (
          <div className="text-center py-16">
            <div className="w-6 h-6 border-2 border-[#f0b90b] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <p className="text-3xl mb-3">&#x1F4E8;</p>
            <p className="text-sm font-medium">아직 피드백이 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {feedbacks.map((fb) => {
              const st = STATUS_LABELS[fb.status] || STATUS_LABELS.pending;
              const cat = CATEGORIES.find((c) => c.value === fb.category);
              return (
                <div key={fb.id} className="p-4 rounded-xl" style={{ backgroundColor: "var(--card)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--bg)] text-[var(--text-muted)]">
                      {cat?.label || fb.category}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${st.color}15`, color: st.color }}
                    >
                      {st.label}
                    </span>
                    <span className="ml-auto text-[11px] text-[var(--text-muted)]">{timeAgo(fb.created_at)}</span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{fb.body}</p>

                  {/* 관리자 답변 */}
                  {fb.admin_reply && (
                    <div className="mt-3 p-3 rounded-lg bg-[#f0b90b]/5 border border-[#f0b90b]/15">
                      <p className="text-[11px] font-bold text-[#f0b90b] mb-1">운영팀 답변</p>
                      <p className="text-sm text-[var(--text-muted)]">{fb.admin_reply}</p>
                    </div>
                  )}

                  {/* 관리자 액션 */}
                  {isAdmin && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2 flex-wrap">
                      {fb.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(fb.id, "accepted")} className="text-[11px] font-bold text-[#22c55e] hover:underline">채택</button>
                          <button onClick={() => updateStatus(fb.id, "rejected")} className="text-[11px] font-bold text-[#6b7280] hover:underline">반려</button>
                        </>
                      )}
                      {fb.status === "accepted" && (
                        <button onClick={() => updateStatus(fb.id, "resolved")} className="text-[11px] font-bold text-[#3b82f6] hover:underline">해결 완료</button>
                      )}
                      <button onClick={() => { setReplyId(replyId === fb.id ? null : fb.id); setReplyText(fb.admin_reply || ""); }} className="text-[11px] font-bold text-[#f0b90b] hover:underline">
                        {replyId === fb.id ? "취소" : "답변"}
                      </button>

                      {replyId === fb.id && (
                        <div className="w-full mt-2 flex gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleReply(fb.id); }}
                            placeholder="답변 작성..."
                            className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f0b90b]"
                          />
                          <button onClick={() => handleReply(fb.id)} className="px-3 py-2 rounded-lg text-sm font-bold text-black bg-[#f0b90b] hover:opacity-90">전송</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
