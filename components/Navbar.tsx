"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

const NAV_LINKS = [
  { label: "홈", href: "/" },
  { label: "뉴스", href: "/news" },
  { label: "카드뉴스", href: "/cardnews" },
  { label: "기업", href: "/company" },
];

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  return (
    <nav className="bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-[var(--text)]">
            US
            <span className="text-[#f0b90b]">sokbo</span>
          </span>
        </a>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/#subscribe"
            className="ml-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black text-[13px] font-bold hover:opacity-90 transition-opacity"
          >
            구독하기
          </a>

          {/* Auth 영역 */}
          {!loading && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-[var(--card)] transition-colors"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt=""
                        width={28}
                        height={28}
                        className="rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#f0b90b] flex items-center justify-center text-black text-xs font-bold">
                        {(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-[12px] text-[var(--text-muted)] max-w-[80px] truncate hidden lg:block">
                      {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#16161e] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-[var(--border)]">
                        <p className="text-sm font-semibold text-[var(--text)] truncate">
                          {user.user_metadata?.full_name || "사용자"}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          signOut();
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-white transition-colors"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#333] text-[12px] font-semibold hover:bg-gray-100 transition-colors"
                >
                  <GoogleIcon />
                  로그인
                </button>
              )}
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text)]"
          aria-label="Toggle menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg)]">
          <div className="px-4 py-3 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                onClick={() => setMenuOpen(false)}
                className="text-[14px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors font-medium py-1"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/#subscribe"
              onClick={() => setMenuOpen(false)}
              className="mt-1 px-4 py-2 rounded-full bg-gradient-to-r from-[#f0b90b] to-[#ef6d09] text-black text-[13px] font-bold text-center"
            >
              구독하기
            </a>

            {/* Mobile Auth */}
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt=""
                          width={24}
                          height={24}
                          className="rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#f0b90b] flex items-center justify-center text-black text-[10px] font-bold">
                          {(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}
                        </div>
                      )}
                      <span className="text-[13px] text-[var(--text-muted)] truncate max-w-[150px]">
                        {user.user_metadata?.full_name || user.email?.split("@")[0]}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      className="text-[12px] text-[var(--text-muted)] hover:text-white transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signInWithGoogle();
                    }}
                    className="flex items-center justify-center gap-2 mt-1 px-4 py-2 rounded-full bg-white text-[#333] text-[13px] font-semibold"
                  >
                    <GoogleIcon />
                    구글 로그인
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
