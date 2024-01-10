import QuickButtons from "@/components/landing_page/quick_buttons";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col bg-scroll bg-center bg-cover"
      style={{ backgroundImage: `url('/background.jpg')` }}
    >
      <header className="w-full flex flew-row justify-start items-center backdrop-blur-md p-2 cursor-default">
        <img src="/app-icon.svg" alt="Logo" className="h-15 w-15 mr-1" />
        <h1 className="text-3xl text-white">ChordSeqAI</h1>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center text-center p-4 space-y-5">
        <h2 className="text-3xl md:text-5xl text-white font-semibold mb-5 max-w-xl">
          Your AI-powered chord progression copilot
        </h2>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl pb-5">
          Compose beautiful chord progressions in your browser, with the help of
          AI, for free. Open-source project, code available on GitHub.
        </p>
        <QuickButtons />
      </main>
    </div>
  );
}
