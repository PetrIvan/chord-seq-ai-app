import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChordSeqAI",
  description:
    "Compose beautiful chord progressions in your browser, with the help of AI, for free. Open-source project, code available on GitHub.",
  manifest: "/manifest.json",
  icons: { icon: "/icon-512x512.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html lang="en">
        <body className="font-sans text-white">{children}</body>
      </html>
    </>
  );
}
