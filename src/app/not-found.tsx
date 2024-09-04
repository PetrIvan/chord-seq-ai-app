import type { Metadata } from "next";
import NotFound from "@/components/not_found";

export const metadata: Metadata = {
  metadataBase: new URL("https://chordseqai.com"),
  title: "404 - ChordSeqAI",
  description: "This page could not be found.",
  manifest: "/manifest.json",
  icons: { icon: "/icon-512x512.png", apple: "/icon-192x192.png" },
  openGraph: {
    images: [{ url: "/og.png" }],
  },
};

export default function Page() {
  return <NotFound />;
}
