import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "US속보 | AI가 선별한 실시간 미국 금융 속보",
  description:
    "매일 AI가 분석한 미국 시장 브리핑, 실시간 속보, 주말 특별판, 기업 심층 분석",
  openGraph: {
    title: "US속보 | AI가 선별한 실시간 미국 금융 속보",
    description:
      "매일 AI가 분석한 미국 시장 브리핑, 실시간 속보, 주말 특별판, 기업 심층 분석",
    siteName: "US속보",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script src="https://cdn.iamport.kr/v1/iamport.js" defer />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
