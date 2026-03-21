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

  const isAdmin = !!user?.email && user.email === ADMIN_EMAIL;

  useEffect(() => {
    setIsInAppBrowser(detectInAppBrowser());
  }, []);

  const checkSubscription = useCallback(async (u: User | null) => {
    if (!u) {
      setIsSubscriber(false);
      return;
    }
    // 관리자는 항상 구독자 취급
    if (u.email === ADMIN_EMAIL) {
      setIsSubscriber(true);
      return;
    }
    const { data } = await supabase
      .from("subscribers")
      .select("id")
      .eq("user_id", u.id)
      .maybeSingle();
    setIsSubscriber(!!data);
  }, []);

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
    <AuthContext.Provider value={{ user, loading, isAdmin, isSubscriber, isInAppBrowser, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
