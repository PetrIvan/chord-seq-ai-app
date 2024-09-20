import dynamic from "next/dynamic";
import LoadingScreen from "@/components/loading_screen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Use ChordSeqAI: AI-Powered Chord Suggester App",
  description:
    "Create beautiful chord progressions with ChordSeqAI. Explore the full potential of AI-driven music composition directly in your browser.",
  openGraph: {
    title: "Use ChordSeqAI: AI-Powered Chord Progression Copilot",
    description:
      "Explore AI-powered chord progression composition on ChordSeqAI. Free to use and open-source.",
    images: [{ url: "/screenshot.jpg" }],
  },
  alternates: {
    canonical: "/app",
  },
  robots: {
    index: false,
    follow: true,
  },
};

const App = dynamic(() => import("@/components/app"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function Page() {
  return <App />;
}
