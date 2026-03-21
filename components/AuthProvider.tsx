"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const ADMIN_EMAIL = "snuyoon@snu.ac.kr";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isSubscriber: boolean;
  isInAppBrowser: boolean;
  freeViews: number;
  freeNewsViews: number;
  canViewVip: boolean;
  useFreeView: () => Promise<boolean>;
  useFreeNewsView: () => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

function detectInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /KAKAOTALK|Instagram|FBAN|FBAV|Line|NAVER|Snapchat|Twitter|micromessenger/i.test(ua);
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isSubscriber: false,
  isInAppBrowser: false,
  freeViews: 0,
  freeNewsViews: 0,
  canViewVip: false,
  useFreeView: async () => false,
  useFreeNewsView: async () => false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [freeViews, setFreeViews] = useState(0);
  const [freeNewsViews, setFreeNewsViews] = useState(0);

  const isAdmin = !!user?.email && user.email === ADMIN_EMAIL;
  const canViewVip = isAdmin || isSubscriber || freeViews > 0;

  useEffect(() => {
    setIsInAppBrowser(detectInAppBrowser());
  }, []);

  const checkSubscription = useCallback(async (u: User | null) => {
    if (!u) {
      setIsSubscriber(false);
      setFreeViews(0);
      setFreeNewsViews(0);
      return;
    }
    // 관리자는 항상 구독자 취급
    if (u.email === ADMIN_EMAIL) {
      setIsSubscriber(true);
      setFreeViews(99);
      setFreeNewsViews(99);
      return;
    }
    const { data } = await supabase
      .from("subscribers")
      .select("id, free_views, free_news_views, payment_status")
      .eq("user_id", u.id)
      .maybeSingle();
    setIsSubscriber(!!data && data.payment_status === "active");
    setFreeViews(data?.free_views ?? 0);
    setFreeNewsViews(data?.free_news_views ?? 0);

    // 로그인했지만 subscribers에 없으면 → 신규 가입, free_views 2 부여
    if (!data) {
      const { data: newRow } = await supabase
        .from("subscribers")
        .upsert(
          { user_id: u.id, email: u.email, free_views: 2, free_news_views: 5, payment_status: "free_trial" },
          { onConflict: "user_id", ignoreDuplicates: true }
        )
        .select("free_views, free_news_views")
        .single();
      if (newRow) {
        setFreeViews(newRow.free_views);
        setFreeNewsViews(newRow.free_news_views);
      }
    }
  }, []);

  const useFreeView = useCallback(async (): Promise<boolean> => {
    if (!user || isSubscriber || isAdmin) return true;
    if (freeViews <= 0) return false;
    const newCount = freeViews - 1;
    const { error } = await supabase
      .from("subscribers")
      .update({ free_views: newCount })
      .eq("user_id", user.id);
    if (!error) {
      setFreeViews(newCount);
      return true;
    }
    return false;
  }, [user, isSubscriber, isAdmin, freeViews]);

  const useFreeNewsView = useCallback(async (): Promise<boolean> => {
    if (!user || isSubscriber || isAdmin) return true;
    if (freeNewsViews <= 0) return false;
    const newCount = freeNewsViews - 1;
    const { error } = await supabase
      .from("subscribers")
      .update({ free_news_views: newCount })
      .eq("user_id", user.id);
    if (!error) {
      setFreeNewsViews(newCount);
      return true;
    }
    return false;
  }, [user, isSubscriber, isAdmin, freeNewsViews]);

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      checkSubscription(u);
      setLoading(false);
    });

    // 인증 상태 변경 리스닝
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        // INITIAL_SESSION은 getSession에서 이미 처리, TOKEN_REFRESHED는 유저 변경 아님
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          checkSubscription(u);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [checkSubscription]);

  const signInWithGoogle = async () => {
    if (detectInAppBrowser()) {
      const currentUrl = window.location.href;
      // iOS: Safari로 열기, Android: Chrome intent
      const ua = navigator.userAgent || "";
      if (/iPhone|iPad/i.test(ua)) {
        // iOS에서 Safari로 강제 오픈
        window.location.href = `x-safari-${currentUrl}`;
        // fallback: 안내 메시지
        setTimeout(() => {
          alert("인앱 브라우저에서는 구글 로그인이 불가합니다.\n\n우측 상단 ⋯ 또는 나침반 아이콘을 눌러\nSafari로 열어주세요.");
        }, 300);
      } else {
        // Android: intent로 Chrome 열기
        window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
        setTimeout(() => {
          alert("인앱 브라우저에서는 구글 로그인이 불가합니다.\n\n우측 상단 ⋮ 메뉴에서\n'기본 브라우저로 열기'를 눌러주세요.");
        }, 300);
      }
      return;
    }

    const redirectUrl = window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://globe-news-web.vercel.app";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsSubscriber(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isSubscriber, isInAppBrowser, freeViews, freeNewsViews, canViewVip, useFreeView, useFreeNewsView, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
