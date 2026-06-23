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
  title: "Centre Street Japanese HotPot | Japanese Hot Pot Restaurant in Calgary",
  description:
    "Centre Street Japanese HotPot, also known as 鼎鑽火鍋, is a Calgary hot pot restaurant serving Japanese-style hot pot, premium meats, fresh seafood, signature broths, Taiwanese snacks, and milk tea.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Centre Street Japanese HotPot | Japanese Hot Pot Restaurant in Calgary",
    description:
      "Japanese-style hot pot, premium meats, fresh seafood, signature broths, Taiwanese snacks, and milk tea in Calgary. Also known as 鼎鑽火鍋.",
    url: "https://centrestjhotpot.ca/",
    siteName: "Centre Street Japanese HotPot",
    images: ["/assets/hero-beef-noodle.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
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
          src="https://www.googletagmanager.com/gtag/js?id=G-JN2E0S7E36"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JN2E0S7E36');
          `}
        </Script>
        <Script src="/analytics.js" strategy="afterInteractive" />
        {children}
        <a className="reserve-sticky" href="tel:+14034553188">
          Call to Reserve · (403) 455-3188
        </a>
      </body>
    </html>
  );
}
