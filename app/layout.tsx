import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bitcoin Price Live - Real-time BTC Tracker",
  description: "Track Bitcoin price in real-time with live updates, charts, and instant currency conversion. Minimalist and fast.",
  keywords: ["Bitcoin", "BTC", "Price", "Live", "Tracker", "Crypto", "Cryptocurrency", "USDT"],
  openGraph: {
    title: "Bitcoin Price Live - Real-time BTC Tracker",
    description: "Track Bitcoin price in real-time with live updates.",
    type: "website",
    siteName: "Bitcoin Price Live",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitcoin Price Live",
    description: "Real-time Bitcoin price tracker.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
