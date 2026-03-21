import type { Metadata } from "next";
import NewsFeed from "@/components/NewsFeed";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "실시간 속보 | US속보",
  description:
    "AI가 선별한 글로벌 금융 뉴스를 실시간으로 확인하세요. 30초마다 자동 업데이트.",
  openGraph: {
    title: "실시간 속보 | US속보",
    description:
      "AI가 선별한 글로벌 금융 뉴스를 실시간으로 확인하세요. 30초마다 자동 업데이트.",
    siteName: "US속보",
  },
  twitter: { card: "summary_large_image" },
};

export default function NewsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-4 md:pt-8 pb-2 md:pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
          실시간{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f0b90b] to-[#ef6d09]">
            속보
          </span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          AI가 선별한 글로벌 금융 뉴스 · 30초마다 업데이트
        </p>
      </div>
      <NewsFeed />
      <Footer />
    </div>
  );
}
