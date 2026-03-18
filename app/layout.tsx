import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "글로벌 금융 속보 AI",
  description: "AI가 선별한 실시간 글로벌 금융 뉴스를 한국어로 제공합니다.",
  openGraph: {
    title: "글로벌 금융 속보 AI",
    description: "AI가 선별한 실시간 글로벌 금융 뉴스",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
