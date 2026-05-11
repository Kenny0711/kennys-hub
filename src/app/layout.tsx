import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: "Kenny's Hub",
  description: 'Kenny 的個人研發門戶：作品集、LeetCode 訓練、研究與工程紀錄整合入口。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full antialiased dark">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
