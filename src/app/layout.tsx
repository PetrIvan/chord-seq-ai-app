import Script from "next/script";
import { Open_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import type { Metadata } from "next";
import "./globals.css";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ChordSeqAI",
  applicationCategory: "Music Composition",
  applicationSubCategory: "AI Music Composition for Chord Progressions",
  url: "https://chordseqai.com",
  operatingSystem: "Web",
  description:
    "Compose beautiful chord progressions in your browser, with the help of AI, for free. Open-source project, code available on GitHub.",
  screenshot: "https://chordseqai.com/screenshot.jpg",
  creator: {
    "@type": "Person",
    name: "XenoMuse",
    description:
      "A passionate developer and AI enthusiast, who focuses on blending technology and music.",
    url: "https://patreon.com/xenomuse",
  },
  keywords:
    "chord progression, music composition, AI, machine learning, open-source",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://chordseqai.com"),
  title: "ChordSeqAI: Your Chord Progression AI Copilot",
  description:
    "Compose beautiful chord progressions in your browser, with the help of AI, for free. Open-source project, code available on GitHub.",
  manifest: "/manifest.json",
  icons: { icon: "/icon-512x512.png", apple: "/icon-192x192.png" },
  openGraph: {
    title: "ChordSeqAI: Your AI-Powered Chord Progression Copilot",
    description:
      "Compose beautiful chord progressions in your browser, with the help of AI, for free. Open-source project, code available on GitHub.",
    images: [{ url: "/og.png" }],
  },
};

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-opensans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html lang="en" className={`${openSans.variable}`}>
        <body className="font-sans text-white">
          <NextTopLoader color="#5B21B6" height={4} showSpinner={false} />
          {children}
        </body>
        <Script
          defer
          src="https://eu.umami.is/script.js"
          data-website-id="0e11269e-4e8c-494b-929c-1f4798eac395"
        />
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </html>
    </>
  );
}
