import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Properties & Autos — Luxury Real Estate, Land Banking & Automobile Marketplace',
  description: 'Buy, rent, and lease land, houses, commercial buildings, cars, and vehicles. Features bidirectional AI matching, verified listings, and real-time bookings.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
