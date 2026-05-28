import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "ccav.com — AI视频制作规范与实践",
  description: "以国家团标为核心的AI视频制作教学平台，覆盖T/CCPS 0041—2026能力等级L1-L6，从文生图到AIGC视频制作全流程。",
  keywords: "AI视频, AIGC, 视频制作, 教学平台, 团标, T/CCPS 0041",
  openGraph: {
    title: "ccav.com — AI视频制作规范与实践",
    description: "以国家团标为核心的AI视频制作教学平台",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col ink-bg">
        <div className="ink-mountain" aria-hidden="true" />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
