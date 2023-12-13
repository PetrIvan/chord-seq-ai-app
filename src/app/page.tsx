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
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl pb-5">
          Compose beautiful chord progressions in your browser, with the help of
          AI, for free. Open-source project, code available on GitHub.
        </p>
        <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-20 space-y-4 md:space-y-0">
          <a
            href="https://github.com/StudentTraineeCenter/chord-seq-ai-app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-white text-black py-7 px-6 rounded-full shadow-md border-2 border-gray-900 text-xl md:text-2xl font-medium transition duration-300 ease-in-out hover:brightness-90 w-48 h-12"
          >
            <img src="/github-logo.svg" alt="GitHub" className="mr-2 h-6 w-6" />
            GitHub
          </a>

          <a
            className="flex items-center justify-center bg-gradient-to-bl from-[#8C205C] to-[#5C51A6] text-white py-7 px-6 rounded-full shadow-md border-2 border-gray-200 text-xl md:text-2xl font-medium transition duration-300 ease-in-out hover:brightness-90 w-48 h-12"
            href="/app"
          >
            Launch App
          </a>
        </div>
      </main>
    </div>
  );
}
