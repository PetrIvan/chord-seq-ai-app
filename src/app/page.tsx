import QuickButtons from "@/components/landing_page/quick_buttons";

export default function Home() {
  return (
    <div>
      <div className="relative flex flex-col bg-[url('/background.jpg')] bg-scroll bg-center bg-cover">
        <header className="w-full flex flew-row justify-start items-center backdrop-blur-md p-2 cursor-default">
          <img src="/app-icon.svg" alt="Logo" className="h-15 w-15 mr-1" />
          <h1 className="text-3xl text-white">ChordSeqAI</h1>
        </header>
        <div className="flex-grow flex flex-col items-center justify-center text-center p-4 space-y-5 backdrop-blur-[0.1dvw] py-20 pb-36 z-20">
          <h2 className="text-3xl md:text-5xl text-white font-semibold mb-5 max-w-xl">
            Your AI-powered chord progression copilot
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl pb-5">
            Compose beautiful chord progressions in your browser, with the help
            of AI, for free. Open-source project, code available on GitHub.
          </p>
          <QuickButtons />
        </div>
        <div className="absolute bottom-0 z-10 w-full h-[15dvh] bg-gradient-to-b from-transparent to-zinc-950" />
      </div>
      <div className="flex flex-col bg-zinc-950">
        <div className="flex-grow flex flex-col items-center justify-center text-center space-y-5 md:space-y-10 backdrop-blur-[0.1dvw] p-5 md:p-20">
          <div className="flex flex-col lg:flex-row items-center justify-center rounded-lg bg-zinc-900 shadow-lg w-full min-h-fit">
            <div className="flex-1 flex flex-col items-center justify-center w-full h-full p-5">
              <h3 className="text-2xl md:text-3xl text-white font-semibold mb-5">
                Add a chord and get suggestions for the next one
              </h3>
              <p className="text-lg md:text-xl text-gray-300 pb-5">
                ChordSeqAI uses neural networks to predict the next chord in a
                progression. It is trained on a large dataset of chord sequences
                from popular music.
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden h-full w-full">
              <video
                src="/showcase-add.mp4"
                className="h-full w-full object-cover object-center rounded-b-lg lg:rounded-r-lg"
                autoPlay
                loop
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row-reverse  items-center justify-center rounded-lg bg-zinc-900 shadow-lg w-full min-h-fit">
            <div className="flex-1 flex flex-col items-center justify-center w-full h-full p-5">
              <h3 className="text-2xl md:text-3xl text-white font-semibold mb-5">
                Specify the style of your chord progression
              </h3>
              <p className="text-lg md:text-xl text-gray-300 pb-5">
                You can specify the genre and the musical period with
                conditional models.
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden h-full w-full">
              <video
                src="/showcase-style.mp4"
                className="h-full w-full object-cover object-center rounded-b-lg lg:rounded-r-lg"
                autoPlay
                loop
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row  items-center justify-center rounded-lg bg-zinc-900 shadow-lg w-full min-h-fit">
            <div className="flex-1 flex flex-col items-center justify-center w-full h-full p-5">
              <h3 className="text-2xl md:text-3xl text-white font-semibold mb-5">
                Integrate with your favorite DAW
              </h3>
              <p className="text-lg md:text-xl text-gray-300 pb-5">
                You can export your chord progressions as MIDI files and import
                them into FL Studio, Ableton Live, Logic Pro, or any other DAW.
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden h-full w-full">
              <video
                src="/showcase-export.mp4"
                className="h-full w-full object-cover object-center rounded-b-lg lg:rounded-r-lg"
                autoPlay
                loop
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
