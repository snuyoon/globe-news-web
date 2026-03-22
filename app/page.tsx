import type { Metadata } from "next";
import TheaterSeats from "@/components/TheaterSeats";

export const metadata: Metadata = {
  title: "US속보 | AI가 선별한 실시간 미국 금융 속보",
  description: "선착순 100석 한정 구독! 매일 AI가 분석한 미국 시장 브리핑, 실시간 속보, 주말 특별판. 지금 나만의 캐릭터로 착석하세요.",
  openGraph: {
    title: "US속보 | AI가 선별한 실시간 미국 금융 속보",
    description: "선착순 100석 한정 구독! 매일 AI가 분석한 미국 시장 브리핑, 실시간 속보, 주말 특별판.",
    url: "https://globe-news-web.vercel.app",
    siteName: "US속보",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "US속보 | AI가 선별한 실시간 미국 금융 속보",
    description: "선착순 100석 한정 구독! 매일 AI가 분석한 미국 시장 브리핑.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <TheaterSeats />
    </div>
  );
}
