import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  metadataBase: new URL("https://centrestjhotpot.ca"),
  title: "Centre Street Japanese HotPot Calgary | $28.99 AYCE",
  description:
    "Visit Centre Street Japanese HotPot in Calgary: $28.99 AYCE + tax, soup base included, or $19.99 personal hot pot. View the menu and call (403) 455-3188.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-CA": "/",
      "zh-Hant-CA": "/zh-hant/",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "Centre Street Japanese HotPot Calgary | $28.99 AYCE",
    description:
      "Calgary hot pot with 15 soup bases: $28.99 AYCE + tax or $19.99 personal hot pot. View the menu and call to reserve.",
    url: "https://centrestjhotpot.ca/",
    siteName: "Centre Street Japanese HotPot",
    images: ["/assets/dish-spicy.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Centre Street Japanese HotPot | AYCE Hot Pot Calgary",
    description:
      "$28.99 AYCE hot pot in Calgary with 15 soup bases. Call (403) 455-3188 to reserve.",
    images: ["/assets/dish-spicy.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script src="/language-routes.js?v=20260813-bilingual" strategy="afterInteractive" />
        <Script src="/meta-events-1108307461722381.js" strategy="afterInteractive" />
        <Script src="/site-events.js?v=20260914-reservation-modal" strategy="afterInteractive" />
        {children}
        <a className="reserve-sticky" href="tel:+14034553188">
          Call to Reserve · (403) 455-3188
        </a>
      </body>
    </html>
  );
}
