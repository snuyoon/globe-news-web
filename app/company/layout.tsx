import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "기업 심층 분석 | US속보",
  description:
    "매주 핫한 기업을 AI가 깊이 분석합니다. 재무, 전략, 투자 포인트를 카드뉴스로 확인하세요.",
  openGraph: {
    title: "기업 심층 분석 | US속보",
    description:
      "매주 핫한 기업을 AI가 깊이 분석합니다. 재무, 전략, 투자 포인트를 카드뉴스로 확인하세요.",
    siteName: "US속보",
  },
  twitter: { card: "summary_large_image" },
};

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
