import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'מספרה — חוויית טיפוח פרימיום',
  description: 'מספרה פרימיום — מערכת הזמנת תורים',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[#100c08] text-[#f5f0eb] antialiased">
        {children}
      </body>
    </html>
  );
}
