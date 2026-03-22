import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MapMyVisitors - Show Where Your Visitors Come From',
  description: 'Beautiful 3D globe widget that displays your website visitors in real-time. One line of code. Works instantly.',
  keywords: ['visitor map', '3D globe', 'website analytics', 'visitor tracking', 'globe widget'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
