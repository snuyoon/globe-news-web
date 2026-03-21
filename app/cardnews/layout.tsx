import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "카드뉴스 브리핑 | US속보",
  description:
    "매일 발행되는 AI 카드뉴스 브리핑. 장전 브리핑, 모닝 브리핑, 주말 특별판을 슬라이드로 확인하세요.",
  openGraph: {
    title: "카드뉴스 브리핑 | US속보",
    description:
      "매일 발행되는 AI 카드뉴스 브리핑. 장전 브리핑, 모닝 브리핑, 주말 특별판을 슬라이드로 확인하세요.",
    siteName: "US속보",
  },
  twitter: { card: "summary_large_image" },
};

export default function CardNewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
