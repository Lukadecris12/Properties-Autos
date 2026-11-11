import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Properties & Autos — Luxury Real Estate, Land Banking & Automobile Marketplace',
  description: 'Buy, rent, and lease land, houses, commercial buildings, cars, and vehicles. Features bidirectional AI matching, verified listings, and real-time bookings.',
  icons: {
    icon: [
      { url: '/favicon-32x32.png?v=3', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=3', sizes: '16x16', type: 'image/png' },
      { url: '/icon.png?v=3', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico?v=3', sizes: 'any' },
    ],
    shortcut: '/favicon.ico?v=3',
    apple: [
      { url: '/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=3" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
