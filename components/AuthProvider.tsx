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
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isSubscriber: false,
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

  const isAdmin = !!user?.email && user.email === ADMIN_EMAIL;

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
    <AuthContext.Provider value={{ user, loading, isAdmin, isSubscriber, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
