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
  title: "Hot Pot Calgary | AYCE $28.99 & 15 Soup Bases | Centre Street",
  description:
    "Hot pot Calgary: Taiwanese and Japanese-style personal hot pot plus AYCE $28.99 + tax, 15 soup bases, snacks and milk tea. Open Mon-Fri 5-10:30, Sat-Sun noon-10:30. Call to reserve.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hot Pot Calgary | AYCE $28.99 & 15 Soup Bases | Centre Street",
    description:
      "Taiwanese and Japanese-style hot pot in Calgary: AYCE $28.99 + tax, 15 soup bases, snacks and milk tea. Call to reserve.",
    url: "https://centrestjhotpot.ca/",
    siteName: "Centre Street Japanese HotPot",
    images: ["/assets/ayce-hotpot-preview.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Centre Street Japanese HotPot | AYCE Hot Pot Calgary",
    description:
      "$28.99 AYCE hot pot in Calgary with 15 soup bases. Call (403) 455-3188 to reserve.",
    images: ["/assets/ayce-hotpot-preview.webp"],
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="/t662/"
          strategy="afterInteractive"
        />
        <Script src="/site-events.js" strategy="afterInteractive" />
        {children}
        <a className="reserve-sticky" href="tel:+14034553188">
          Call to Reserve · (403) 455-3188
        </a>
      </body>
    </html>
  );
}
