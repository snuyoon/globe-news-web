"use client";

import { useState, useEffect, useCallback } from "react";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { grantXp } from "@/lib/xp";

interface Post {
  id: number;
  user_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  created_at: string;
  author_name?: string;
  author_seat?: number | null;
  author_level?: number;
  comment_count?: number;
}

interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  body: string;
  created_at: string;
  author_name?: string;
  author_seat?: number | null;
  author_level?: number;
}

const LEVEL_NAMES: Record<number, { name: string; color: string }> = {
  1: { name: "루키", color: "#6b7280" },
  2: { name: "트레이더", color: "#22c55e" },
  3: { name: "애널리스트", color: "#3b82f6" },
  4: { name: "매니저", color: "#a855f7" },
  5: { name: "디렉터", color: "#f0b90b" },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

function AuthorBadge({ name, seat, level }: { name: string; seat?: number | null; level?: number }) {
  const lvl = LEVEL_NAMES[level || 1] || LEVEL_NAMES[1];
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
        style={{ backgroundColor: `${lvl.color}20`, color: lvl.color }}
      >
        {name[0]?.toUpperCase() || "?"}
      </div>
      <div className="flex items-center gap-1.5">
        {seat && <span className="text-[11px] text-[var(--text-muted)]">#{seat}</span>}
        <span className="text-[12px] font-medium">{name}</span>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${lvl.color}15`, color: lvl.color }}>
          Lv.{level || 1}
        </span>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const { user, loading, isSubscriber, isAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showWrite, setShowWrite] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openPostId, setOpenPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const canWrite = isSubscriber || isAdmin;

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    const { data: postRows } = await supabase
      .from("posts")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (!postRows) { setLoadingPosts(false); return; }

    // 작성자 정보
    const userIds = [...new Set(postRows.map((p) => p.user_id))];
    const { data: subs } = await supabase
      .from("subscribers")
      .select("user_id, name, email, seat_number, level")
      .in("user_id", userIds);

    const subMap = new Map((subs || []).map((s) => [s.user_id, s]));

    // 댓글 수
    const postIds = postRows.map((p) => p.id);
    const { data: commentCounts } = await supabase
      .from("comments")
      .select("post_id")
      .in("post_id", postIds);

    const countMap = new Map<number, number>();
    (commentCounts || []).forEach((c) => {
      countMap.set(c.post_id, (countMap.get(c.post_id) || 0) + 1);
    });

    setPosts(postRows.map((p) => {
      const sub = subMap.get(p.user_id);
      return {
        ...p,
        author_name: sub?.name || sub?.email?.split("@")[0] || "익명",
        author_seat: sub?.seat_number,
        author_level: sub?.level || 1,
        comment_count: countMap.get(p.id) || 0,
      };
    }));
    setLoadingPosts(false);
  }, []);

  const fetchComments = useCallback(async (postId: number) => {
    setLoadingComments(true);
    const { data: commentRows } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!commentRows) { setLoadingComments(false); return; }

    const userIds = [...new Set(commentRows.map((c) => c.user_id))];
    const { data: subs } = await supabase
      .from("subscribers")
      .select("user_id, name, email, seat_number, level")
      .in("user_id", userIds);

    const subMap = new Map((subs || []).map((s) => [s.user_id, s]));

    setComments(commentRows.map((c) => {
      const sub = subMap.get(c.user_id);
      return {
        ...c,
        author_name: sub?.name || sub?.email?.split("@")[0] || "익명",
        author_seat: sub?.seat_number,
        author_level: sub?.level || 1,
      };
    }));
    setLoadingComments(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSubmitPost = async () => {
    if (!user || !title.trim() || !body.trim() || submitting) return;
    setSubmitting(true);
    await supabase.from("posts").insert({ user_id: user.id, title: title.trim(), body: body.trim() });
    grantXp(user.id, "post_create");
    setTitle("");
    setBody("");
    setShowWrite(false);
    setSubmitting(false);
    fetchPosts();
  };

  const handleSubmitComment = async () => {
    if (!user || !commentBody.trim() || !openPostId || submitting) return;
    setSubmitting(true);
    await supabase.from("comments").insert({ post_id: openPostId, user_id: user.id, body: commentBody.trim() });
    grantXp(user.id, "comment_create");
    setCommentBody("");
    setSubmitting(false);
    fetchComments(openPostId);
    fetchPosts(); // 댓글 수 업데이트
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("정말 삭제하시겠어요?")) return;
    await supabase.from("posts").delete().eq("id", postId);
    if (openPostId === postId) setOpenPostId(null);
    fetchPosts();
  };

  const openPost = (postId: number) => {
    setOpenPostId(postId);
    fetchComments(postId);
  };

  const selectedPost = posts.find((p) => p.id === openPostId);

  return (
    <>
      <main className="min-h-screen pt-20 pb-24 px-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold mb-1">커뮤니티</h1>
            <p className="text-sm text-[var(--text-muted)]">구독자들과 의견을 나눠보세요</p>
          </div>
          {canWrite && (
            <button
              onClick={() => setShowWrite(!showWrite)}
              className="px-4 py-2 rounded-lg text-sm font-bold text-black bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] hover:opacity-90 transition-opacity"
            >
              {showWrite ? "취소" : "글쓰기"}
            </button>
          )}
        </div>

        {!canWrite && !loading && (
          <div className="mb-6 p-4 rounded-xl bg-[#f0b90b]/5 border border-[#f0b90b]/15 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              {!user ? "회원가입 후 커뮤니티를 이용할 수 있어요" : "구독자만 글을 쓸 수 있어요"}
            </p>
          </div>
        )}

        {/* 글쓰기 폼 */}
        {showWrite && (
          <div className="mb-6 p-5 rounded-xl" style={{ backgroundColor: "var(--card)" }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full bg-transparent border-b border-[var(--border)] pb-3 mb-3 text-base font-bold outline-none placeholder:text-[var(--text-muted)]/50 focus:border-[#f0b90b] transition-colors"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="내용을 입력하세요..."
              rows={4}
              className="w-full bg-transparent text-sm text-[var(--text-muted)] outline-none resize-none placeholder:text-[var(--text-muted)]/50"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleSubmitPost}
                disabled={!title.trim() || !body.trim() || submitting}
                className="px-5 py-2 rounded-lg text-sm font-bold text-black bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {submitting ? "게시 중..." : "게시하기"}
              </button>
            </div>
          </div>
        )}

        {/* 글 목록 */}
        {loadingPosts ? (
          <div className="text-center py-16">
            <div className="w-6 h-6 border-2 border-[#f0b90b] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <p className="text-3xl mb-3">&#x1F4AC;</p>
            <p className="text-sm font-medium">아직 게시글이 없습니다</p>
            <p className="text-xs mt-1">첫 번째 글을 작성해보세요!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <button
                key={post.id}
                onClick={() => openPost(post.id)}
                className={`text-left p-4 rounded-xl transition-all hover:scale-[1.01] ${
                  openPostId === post.id ? "ring-1 ring-[#f0b90b]/30" : ""
                }`}
                style={{ backgroundColor: "var(--card)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {post.is_pinned && <span className="text-[11px] font-bold text-[#f0b90b] bg-[#f0b90b]/10 px-2 py-0.5 rounded-full">&#x1F4CC; 공지</span>}
                      <h3 className="text-sm font-bold line-clamp-1">{post.title}</h3>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">{post.body}</p>
                    <div className="flex items-center justify-between">
                      <AuthorBadge name={post.author_name || "익명"} seat={post.author_seat} level={post.author_level} />
                      <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                        <span>&#x1F4AC; {post.comment_count}</span>
                        <span>{timeAgo(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 글 상세 + 댓글 */}
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto" onClick={() => setOpenPostId(null)}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <div
              className="relative w-full max-w-2xl mx-4 my-8 md:my-16 rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--card)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 닫기 */}
              <button onClick={() => setOpenPostId(null)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)] hover:text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
              </button>

              <div className="p-5 md:p-8">
                {/* 제목 */}
                <div className="flex items-center gap-2 mb-1">
                  {selectedPost.is_pinned && <span className="text-[11px] font-bold text-[#f0b90b] bg-[#f0b90b]/10 px-2 py-0.5 rounded-full">&#x1F4CC; 공지</span>}
                </div>
                <h1 className="text-lg md:text-xl font-bold mb-3">{selectedPost.title}</h1>

                <div className="flex items-center justify-between mb-5">
                  <AuthorBadge name={selectedPost.author_name || "익명"} seat={selectedPost.author_seat} level={selectedPost.author_level} />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--text-muted)]">{timeAgo(selectedPost.created_at)}</span>
                    {(isAdmin || user?.id === selectedPost.user_id) && (
                      <button onClick={() => handleDeletePost(selectedPost.id)} className="text-[11px] text-[#ef4444] hover:underline">삭제</button>
                    )}
                  </div>
                </div>

                {/* 본문 */}
                <div className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line mb-6 pb-6 border-b border-[var(--border)]">
                  {selectedPost.body}
                </div>

                {/* 댓글 */}
                <h3 className="text-sm font-bold mb-4">&#x1F4AC; 댓글 {comments.length}개</h3>

                {loadingComments ? (
                  <div className="text-center py-4">
                    <div className="w-5 h-5 border-2 border-[#f0b90b] border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 mb-5">
                    {comments.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg)" }}>
                        <div className="flex items-center justify-between mb-2">
                          <AuthorBadge name={c.author_name || "익명"} seat={c.author_seat} level={c.author_level} />
                          <span className="text-[11px] text-[var(--text-muted)]">{timeAgo(c.created_at)}</span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{c.body}</p>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <p className="text-center text-xs text-[var(--text-muted)] py-4">아직 댓글이 없어요</p>
                    )}
                  </div>
                )}

                {/* 댓글 입력 */}
                {user ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitComment(); } }}
                      placeholder={canWrite ? "댓글을 입력하세요..." : "구독자만 댓글을 쓸 수 있어요"}
                      disabled={!canWrite}
                      className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#f0b90b] transition-colors disabled:opacity-40 placeholder:text-[var(--text-muted)]/50"
                    />
                    <button
                      onClick={handleSubmitComment}
                      disabled={!canWrite || !commentBody.trim() || submitting}
                      className="px-4 py-2.5 rounded-lg text-sm font-bold text-black bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] hover:opacity-90 disabled:opacity-40 transition-opacity"
                    >
                      등록
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-xs text-[var(--text-muted)] py-2">로그인 후 댓글을 작성할 수 있어요</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
