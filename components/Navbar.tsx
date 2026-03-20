"use client";

import { useState } from "react";

const NAV_LINKS = [
  { label: "홈", href: "/" },
  { label: "뉴스", href: "/news" },
  { label: "카드뉴스", href: "/cardnews" },
  { label: "기업", href: "/company" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          </div>
        </div>
      )}
    </nav>
  );
}
