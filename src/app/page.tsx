import QuickButtons from "@/components/landing_page/quick_buttons";
import SupportUsButton from "@/components/landing_page/support_us_button";
import SupportUsOverlay from "@/components/landing_page/support_us_overlay";

export default function Home() {
  return (
    <div>
      <SupportUsOverlay />
      <div className="relative flex flex-col bg-[url('/background.jpg')] bg-scroll bg-center bg-cover">
        <header className="w-full flex flew-row justify-start items-center backdrop-blur-md p-2 cursor-default pr-2">
          <div className="w-full flex flex-row justify-start items-center">
            <img src="/app-icon.svg" alt="Logo" className="h-15 w-15 mr-1" />
            <h1 className="text-3xl text-white">ChordSeqAI</h1>
          </div>

          <SupportUsButton />
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
                Add a chord and get the next one suggested
              </h3>
              <p className="text-lg md:text-xl text-gray-300 pb-5">
                ChordSeqAI uses neural networks to predict the next chord in a
                progression. It was trained on a large dataset of chord
                sequences from popular music.
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden h-full w-full">
              <video
                src="/showcase-add.mp4"
                className="h-full w-full object-cover object-center rounded-b-lg lg:rounded-r-lg"
                autoPlay
                muted
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
                muted
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
                muted
                loop
              />
            </div>
          </div>

          <div className="w-full h-[3dvh] bg-gradient-to-b from-transparent to-zinc-900" />

          <div className="flex flex-col items-center justify-center shadow-lg max-w-3xl p-5 space-y-2">
            <h3 className="text-2xl md:text-3xl text-white font-semibold mb-5">
              Model Overview
            </h3>
            <ul className="flex flex-col items-start space-y-2 text-justify text-lg md:text-xl text-gray-200 pb-5">
              <li>
                <b>Recurrent Network.</b> A simple network for low-end devices.
              </li>
              <li>
                <b>Transformer models.</b> More powerful networks for everyday
                use. Three variants are available: small, medium, and large.
                Larger models are more accurate but slower.
              </li>
              <li>
                <b>Conditional Transformer models.</b> Specify the genre and the
                musical period of your chord progression. Great if you know what
                you are looking for. Available in different sizes, just like the
                Transformer.
              </li>
            </ul>
          </div>

          <div className="w-full h-[3dvh] bg-gradient-to-b from-zinc-900 to-transparent" />

          <div className="flex flex-col items-center justify-center shadow-lg max-w-3xl p-5 space-y-2">
            <h3 className="text-2xl md:text-3xl text-white font-semibold mb-5">
              Learn more
            </h3>
            <ul className="flex flex-col items-start space-y-2 text-justify text-lg md:text-xl text-gray-200 pb-5">
              <li>
                <b>Documentation.</b> You can view all of the available features{" "}
                <a
                  className="text-blue-400 hover:underline"
                  href="https://github.com/PetrIvan/chord-seq-ai-app/wiki"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here
                </a>
                .
              </li>
              <li>
                <b>Device support.</b> Currently available only on desktop
                devices.
              </li>
              <li>
                <b>Origin.</b> This app comes from a graduate project (see{" "}
                <a
                  className="text-blue-400 hover:underline"
                  href="https://github.com/StudentTraineeCenter/chord-seq-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  the original repository
                </a>
                ).
              </li>
            </ul>
          </div>

          <div className="w-full h-[2px] flex flex-row items-center justify-center">
            <hr className="h-[2px] w-1/2 my-8 bg-gradient-to-r from-transparent to-zinc-800 border-0" />
            <hr className="h-[2px] w-1/2 my-8 bg-gradient-to-l from-transparent to-zinc-800 border-0" />
          </div>

          <div className="flex flex-col items-center justify-center shadow-lg max-w-2xl p-5 space-y-2">
            <h3 className="text-2xl md:text-3xl text-white font-semibold mb-5">
              Contact Us
            </h3>
            <p className="text-lg md:text-xl text-gray-200 pb-5">
              To report bugs or request features, use either{" "}
              <a
                className="text-blue-400 hover:underline"
                href="https://github.com/PetrIvan/chord-seq-ai-app/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Issues
              </a>{" "}
              or contact me by mail at{" "}
              <a
                className="text-blue-400 hover:underline"
                href="mailto:petr.ivan.junior@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                petr.ivan.junior@gmail.com
              </a>
              .
            </p>

            {/* Only visible on mobile devices */}
            <p className="md:hidden text-lg md:text-xl text-gray-200 pb-5">
              If you want to support the development of this app, you can do so
              on{" "}
              <a
                className="text-blue-400 hover:underline"
                href="https://patreon.com/xenomuse"
                target="_blank"
                rel="noopener noreferrer"
              >
                Patreon
              </a>
              , or if you prefer a one-time donation, you can use{" "}
              <a
                className="text-blue-400 hover:underline"
                href="https://paypal.me/xenomuse"
                target="_blank"
                rel="noopener noreferrer"
              >
                PayPal
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
