"use client";

import { useState, useEffect, useCallback } from "react";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { grantXp } from "@/lib/xp";
import { timeAgo } from "@/lib/utils";
import Character from "@/components/Character";

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
  author_character?: Record<string, string> | null;
  comment_count?: number;
  like_count?: number;
  liked_by_me?: boolean;
  is_hot?: boolean;
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
  author_character?: Record<string, string> | null;
}

const LEVEL_NAMES: Record<number, { name: string; color: string }> = {
  1: { name: "루키", color: "#6b7280" },
  2: { name: "트레이더", color: "#22c55e" },
  3: { name: "애널리스트", color: "#3b82f6" },
  4: { name: "매니저", color: "#a855f7" },
  5: { name: "디렉터", color: "#f0b90b" },
};

const LUCKY_SEATS = new Set([1, 7, 77, 100]);

function AuthorBadge({ name, seat, level, characterData }: { name: string; seat?: number | null; level?: number; characterData?: Record<string, string> | null }) {
  const lvl = LEVEL_NAMES[level || 1] || LEVEL_NAMES[1];
  const isLucky = seat ? LUCKY_SEATS.has(seat) : false;
  return (
    <div className="flex items-center gap-3">
      {/* 캐릭터 카드 (큰 사이즈) */}
      <div className="relative flex-shrink-0">
        {characterData ? (
          <div className="w-12 h-12">
            <Character
              hoodieColor={characterData.hoodieColor || "#2d2d3d"}
              eyeStyle={(characterData.eyeStyle as "dot") || "dot"}
              hairStyle={(characterData.hairStyle as "bangs") || "bangs"}
              skinTone={(characterData.skinTone as "#fce4c8") || "#fce4c8"}
              accessory={(characterData.accessory as "none") || "none"}
              initial={characterData.initial || name[0]?.toUpperCase() || "?"}
              size={48}
            />
          </div>
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: `${lvl.color}20`, color: lvl.color }}
          >
            {name[0]?.toUpperCase() || "?"}
          </div>
        )}
        {/* 왕관 — 캐릭터 머리 위 */}
        {seat && (
          <div className="absolute -top-[8px] left-1/2 -translate-x-1/2 text-[14px]">
            {isLucky ? (
              <span style={{ filter: "drop-shadow(0 0 4px #00d4ff) drop-shadow(0 0 8px #00d4ff80)" }}>&#x1F451;</span>
            ) : (
              <span className="opacity-40">&#x1F451;</span>
            )}
          </div>
        )}
      </div>
      {/* 이름 + 좌석 + 레벨 */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold">{name}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${lvl.color}15`, color: lvl.color }}>
            Lv.{level || 1}
          </span>
        </div>
        {seat && <span className="text-[11px] text-[var(--text-muted)]">#{seat}석</span>}
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
    const { data: postRows, error: postErr } = await supabase
      .from("posts")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (postErr || !postRows) { setLoadingPosts(false); return; }

    // 작성자 정보
    const userIds = [...new Set(postRows.map((p) => p.user_id))];
    const { data: subs } = await supabase
      .from("subscribers")
      .select("user_id, name, email, seat_number, level, character_data")
      .in("user_id", userIds);

    const subMap = new Map((subs || []).map((s) => [s.user_id, s]));

    // 댓글 수 + 좋아요 수
    const postIds = postRows.map((p) => p.id);
    const [{ data: commentCounts }, { data: likeCounts }, { data: myLikes }] = await Promise.all([
      supabase.from("comments").select("post_id").in("post_id", postIds),
      supabase.from("post_likes").select("post_id").in("post_id", postIds),
      user
        ? supabase.from("post_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds)
        : Promise.resolve({ data: [] as { post_id: number }[] }),
    ]);

    const commentCountMap = new Map<number, number>();
    (commentCounts || []).forEach((c) => {
      commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
    });

    const likeCountMap = new Map<number, number>();
    (likeCounts || []).forEach((l) => {
      likeCountMap.set(l.post_id, (likeCountMap.get(l.post_id) || 0) + 1);
    });

    const myLikeSet = new Set((myLikes || []).map((l) => l.post_id));
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const HOT_THRESHOLD = 3;

    const mapped = postRows.map((p) => {
      const sub = subMap.get(p.user_id);
      const likes = likeCountMap.get(p.id) || 0;
      const isRecent = new Date(p.created_at).getTime() > oneWeekAgo;
      return {
        ...p,
        author_name: sub?.name || sub?.email?.split("@")[0] || "익명",
        author_seat: sub?.seat_number,
        author_level: sub?.level || 1,
        author_character: sub?.character_data || null,
        comment_count: commentCountMap.get(p.id) || 0,
        like_count: likes,
        liked_by_me: myLikeSet.has(p.id),
        is_hot: isRecent && likes >= HOT_THRESHOLD,
      };
    });

    // 정렬: 공지 → 핫게시글 → 최신순
    mapped.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      if (a.is_hot !== b.is_hot) return a.is_hot ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setPosts(mapped);
    setLoadingPosts(false);
  }, [user]);

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
      .select("user_id, name, email, seat_number, level, character_data")
      .in("user_id", userIds);

    const subMap = new Map((subs || []).map((s) => [s.user_id, s]));

    setComments(commentRows.map((c) => {
      const sub = subMap.get(c.user_id);
      return {
        ...c,
        author_name: sub?.name || sub?.email?.split("@")[0] || "익명",
        author_seat: sub?.seat_number,
        author_level: sub?.level || 1,
        author_character: sub?.character_data || null,
      };
    }));
    setLoadingComments(false);
  }, []);

  const toggleLike = useCallback(async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    // 낙관적 업데이트 (posts 의존성 제거)
    let wasLiked = false;
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p;
      wasLiked = !!p.liked_by_me;
      return { ...p, liked_by_me: !p.liked_by_me, like_count: (p.like_count || 0) + (p.liked_by_me ? -1 : 1) };
    }));

    if (wasLiked) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
    }
  }, [user]);

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
    document.body.style.overflow = "hidden";
  };

  const closePost = () => {
    setOpenPostId(null);
    document.body.style.overflow = "";
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape" && openPostId) closePost(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openPostId]);

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
            {posts.map((post, idx) => {
              const isLocked = !canWrite && !post.is_pinned && idx >= 3;
              return (
              <button
                key={post.id}
                onClick={() => { if (isLocked) return; openPost(post.id); }}
                className={`text-left rounded-xl transition-all ${isLocked ? "opacity-60" : "hover:scale-[1.01]"} ${
                  openPostId === post.id ? "ring-1 ring-[#f0b90b]/30" : ""
                } flex overflow-hidden`}
                style={{ backgroundColor: "var(--card)" }}
              >
                {/* 왼쪽: 캐릭터 카드 */}
                <div className="flex-shrink-0 w-20 md:w-24 flex flex-col items-center justify-center py-4 px-2" style={{ backgroundColor: "var(--bg)" }}>
                  {post.author_character ? (
                    <div className="relative">
                      {post.author_seat && (
                        <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 text-[12px] z-10">
                          {LUCKY_SEATS.has(post.author_seat) ? (
                            <span style={{ filter: "drop-shadow(0 0 3px #00d4ff)" }}>&#x1F451;</span>
                          ) : (
                            <span className="opacity-40">&#x1F451;</span>
                          )}
                        </div>
                      )}
                      <Character
                        hoodieColor={post.author_character.hoodieColor || "#2d3035"}
                        eyeStyle={(post.author_character.eyeStyle as "dot") || "dot"}
                        hairStyle={(post.author_character.hairStyle as "bangs") || "bangs"}
                        skinTone={(post.author_character.skinTone as "#ffffff") || "#ffffff"}
                        accessory={(post.author_character.accessory as "none") || "none"}
                        initial={post.author_character.initial || (post.author_name || "?")[0]}
                        size={56}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--card)] flex items-center justify-center text-sm font-bold text-[var(--text-muted)]">
                      {(post.author_name || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <p className="text-[10px] font-bold mt-1 text-center truncate w-full">{post.author_name || "익명"}</p>
                  {post.author_seat && <p className="text-[9px] text-[var(--text-muted)]">#{post.author_seat}석</p>}
                </div>

                {/* 오른쪽: 글 내용 */}
                <div className="flex-1 min-w-0 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    {post.is_pinned && <span className="text-[11px] font-bold text-[#f0b90b] bg-[#f0b90b]/10 px-2 py-0.5 rounded-full">&#x1F4CC; 공지</span>}
                    {post.is_hot && <span className="text-[11px] font-bold text-[#ef4444] bg-[#ef4444]/10 px-2 py-0.5 rounded-full">HOT</span>}
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${(LEVEL_NAMES[post.author_level || 1] || LEVEL_NAMES[1]).color}15`, color: (LEVEL_NAMES[post.author_level || 1] || LEVEL_NAMES[1]).color }}>
                      Lv.{post.author_level || 1}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold line-clamp-1 mb-1">{post.title}</h3>
                  <p className={`text-xs text-[var(--text-muted)] line-clamp-2 mb-2 ${isLocked ? "blur-sm select-none" : ""}`}>{post.body}</p>
                  {isLocked && (
                    <p className="text-[11px] text-[#f0b90b] font-medium mb-2">구독하면 전체 게시글을 볼 수 있어요</p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                    <button
                      onClick={(e) => toggleLike(post.id, e)}
                      className={`flex items-center gap-1 transition-colors ${post.liked_by_me ? "text-[#ef4444]" : "hover:text-[#ef4444]"}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={post.liked_by_me ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {(post.like_count || 0) > 0 && <span>{post.like_count}</span>}
                    </button>
                    <span>&#x1F4AC; {post.comment_count}</span>
                    <span>{timeAgo(post.created_at)}</span>
                  </div>
                </div>
              </button>
            );
            })}
          </div>
        )}

        {/* 글 상세 + 댓글 */}
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto" onClick={closePost}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <div
              className="relative w-full max-w-2xl mx-4 my-8 md:my-16 rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--card)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 닫기 */}
              <button onClick={closePost} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)] hover:text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
              </button>

              <div className="p-5 md:p-8">
                {/* 제목 */}
                <div className="flex items-center gap-2 mb-1">
                  {selectedPost.is_pinned && <span className="text-[11px] font-bold text-[#f0b90b] bg-[#f0b90b]/10 px-2 py-0.5 rounded-full">&#x1F4CC; 공지</span>}
                </div>
                <h1 className="text-lg md:text-xl font-bold mb-3">{selectedPost.title}</h1>

                <div className="flex items-center justify-between mb-5">
                  <AuthorBadge name={selectedPost.author_name || "익명"} seat={selectedPost.author_seat} level={selectedPost.author_level} characterData={selectedPost.author_character} />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--text-muted)]">{timeAgo(selectedPost.created_at)}</span>
                    {(isAdmin || user?.id === selectedPost.user_id) && (
                      <button onClick={() => handleDeletePost(selectedPost.id)} className="text-[11px] text-[#ef4444] hover:underline">삭제</button>
                    )}
                  </div>
                </div>

                {/* 본문 */}
                <div className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line mb-4">
                  {selectedPost.body}
                </div>

                {/* 따봉 */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border)]">
                  <button
                    onClick={(e) => toggleLike(selectedPost.id, e)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selectedPost.liked_by_me
                        ? "border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]"
                        : "border-[var(--border)] text-[var(--text-muted)] hover:border-[#ef4444]/30 hover:text-[#ef4444]"
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={selectedPost.liked_by_me ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    추천 {(selectedPost.like_count || 0) > 0 && selectedPost.like_count}
                  </button>
                  {selectedPost.is_hot && (
                    <span className="text-[12px] font-bold text-[#ef4444] bg-[#ef4444]/10 px-3 py-1.5 rounded-full">HOT</span>
                  )}
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
                          <AuthorBadge name={c.author_name || "익명"} seat={c.author_seat} level={c.author_level} characterData={c.author_character} />
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
