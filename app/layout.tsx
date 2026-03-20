import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "US속보 - AI 미국 금융 속보",
  description:
    "AI가 선별한 실시간 미국 금융 속보. 모닝 브리핑, 장전 브리핑, 카드뉴스를 제공합니다.",
  openGraph: {
    title: "US속보 - AI 미국 금융 속보",
    description: "AI가 선별한 실시간 미국 금융 속보",
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
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
