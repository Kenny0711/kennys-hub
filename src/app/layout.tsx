import type { Metadata } from 'next';
import { Archivo, Bebas_Neue, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/navbar';

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas-neue',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

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
    <html
      lang="zh-TW"
      className={`${archivo.variable} ${bebasNeue.variable} ${ibmPlexMono.variable} h-full antialiased dark`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
