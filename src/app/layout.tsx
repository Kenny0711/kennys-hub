import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: "Kenny's Hub",
  description: 'Kenny 的個人研發中心，整合 LeetCode 追蹤、作品集與學習紀錄。',
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
