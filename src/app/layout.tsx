import { Open_Sans } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChordSeqAI",
  description:
    "Compose beautiful chord progressions in your browser, with the help of AI, for free. Open-source project, code available on GitHub.",
  manifest: "/manifest.json",
  icons: { icon: "/icon-512x512.png" },
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
        <body className="font-sans text-white">{children}</body>
      </html>
    </>
  );
}
