import QuickButtons from "@/components/landing_page/quick_buttons";
import TrackedLink from "@/components/landing_page/tracked_link";
import SupportUsOverlay from "@/components/overlays/support_us_overlay";
import Header from "@/components/header";

import Image from "next/image";

export default function Home() {
  return (
    <div>
      <SupportUsOverlay />
      <div className="relative flex flex-col bg-[url('/background.jpg')] bg-cover bg-scroll bg-center">
        <Header
          isTop={true}
          sticky={false}
          h1Logo={true}
          customScrollbarEnabled={false}
          searchEnabled={false}
          sidenavEnabled={false}
          borderEnabled={false}
        />
        <div className="z-20 flex flex-grow flex-col items-center justify-center space-y-5 p-4 py-20 pb-36 text-center backdrop-blur-[0.1dvw]">
          <h2 className="mb-5 max-w-xl text-3xl font-semibold text-white md:text-5xl">
            Your AI-powered chord progression copilot
          </h2>
          <p className="max-w-2xl pb-5 text-lg text-zinc-300 md:text-xl">
            Compose beautiful chord progressions in your browser, with the help
            of AI, for free. Open-source project, code available on GitHub.
          </p>
          <QuickButtons />
        </div>
        <div className="absolute bottom-0 z-10 h-[15dvh] w-full bg-gradient-to-b from-transparent to-zinc-950" />
      </div>
      <div className="flex flex-col bg-zinc-950">
        <div className="flex flex-grow flex-col items-center justify-center space-y-5 p-5 text-center backdrop-blur-[0.1dvw] md:space-y-10 md:p-20">
          <div className="flex min-h-fit w-full flex-col items-center justify-center rounded-lg bg-zinc-900 shadow-lg lg:flex-row">
            <div className="flex h-full w-full flex-1 flex-col items-center justify-center p-5">
              <h3 className="mb-5 text-2xl font-semibold text-white md:text-3xl">
                Add a chord and get the next one suggested
              </h3>
              <p className="pb-5 text-lg text-zinc-300 md:text-xl">
                ChordSeqAI uses neural networks to predict the next chord in a
                progression. It was trained on a large dataset of chord
                sequences from popular music.
              </p>
            </div>
            <div className="flex h-full w-full flex-1 flex-col items-center justify-center overflow-hidden">
              <video
                src="/showcase-add.mp4"
                className="h-full w-full rounded-b-lg object-cover object-center lg:rounded-r-lg lg:rounded-bl-none"
                autoPlay
                muted
                loop
              >
                Your browser does not support the video tag. Demo of adding a
                chord in the ChordSeqAI interface.
              </video>
            </div>
          </div>

          <div className="flex min-h-fit w-full flex-col items-center justify-center rounded-lg bg-zinc-900 shadow-lg lg:flex-row-reverse">
            <div className="flex h-full w-full flex-1 flex-col items-center justify-center p-5">
              <h3 className="mb-5 text-2xl font-semibold text-white md:text-3xl">
                Specify the style of your chord progression
              </h3>
              <p className="pb-5 text-lg text-zinc-300 md:text-xl">
                You can specify the genre and the musical period with
                conditional models.
              </p>
            </div>
            <div className="flex h-full w-full flex-1 flex-col items-center justify-center overflow-hidden">
              <video
                src="/showcase-style.mp4"
                className="h-full w-full rounded-b-lg object-cover object-center lg:rounded-l-lg lg:rounded-br-none"
                autoPlay
                muted
                loop
              >
                Your browser does not support the video tag. Demo of specifying
                chord progression style and genre in ChordSeqAI.
              </video>
            </div>
          </div>

          <div className="flex min-h-fit w-full flex-col items-center justify-center rounded-lg bg-zinc-900 shadow-lg lg:flex-row">
            <div className="flex h-full w-full flex-1 flex-col items-center justify-center p-5">
              <h3 className="mb-5 text-2xl font-semibold text-white md:text-3xl">
                Integrate with your favorite DAW
              </h3>
              <p className="pb-5 text-lg text-zinc-300 md:text-xl">
                You can export your chord progressions as MIDI files and import
                them into FL Studio, Ableton Live, Logic Pro, or any other DAW.
              </p>
            </div>
            <div className="flex h-full w-full flex-1 flex-col items-center justify-center overflow-hidden">
              <video
                src="/showcase-export.mp4"
                className="h-full w-full rounded-b-lg object-cover object-center lg:rounded-r-lg lg:rounded-bl-none"
                autoPlay
                muted
                loop
              >
                Your browser does not support the video tag. Demo of exporting
                chord progressions as MIDI files from ChordSeqAI.
              </video>
            </div>
          </div>

          <div className="h-[2dvh] w-full" />

          <div className="flex min-h-fit w-full flex-col items-center justify-center rounded-lg bg-zinc-950 drop-shadow-[0_0px_15px_rgba(24,24,27,1)] lg:flex-row">
            <div className="flex h-full w-full flex-1 flex-col items-center justify-center p-5">
              <h3 className="mb-5 text-2xl font-semibold text-white md:text-3xl">
                Start your learning journey
              </h3>
              <p className="px-5 pb-5 text-justify text-lg text-zinc-300 md:text-xl">
                Check out our YouTube playlist covering the essentials of
                ChordSeqAI. Starting from the basics and eventually covering
                advanced topics, it will help you get the most out of the app.
              </p>
            </div>
            <div className="flex h-full w-full flex-1 flex-col items-center justify-center overflow-hidden">
              <iframe
                className="aspect-video h-full w-full rounded-b-lg object-cover object-center lg:rounded-r-lg lg:rounded-bl-none"
                src="https://www.youtube.com/embed/videoseries?si=t-XM9ujWyvSJyIbj&amp;list=PLT4SeTqv-OaknHUttzBYHr2gmKemcEXkp"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

          <div className="h-[1dvh] w-full" />

          <div className="h-[3dvh] w-full bg-gradient-to-b from-transparent to-zinc-900" />

          <div className="flex max-w-3xl flex-col items-center justify-center space-y-2 p-5 shadow-lg">
            <h3 className="mb-5 text-2xl font-semibold text-white md:text-3xl">
              Model overview
            </h3>
            <ul className="flex flex-col items-start space-y-2 pb-5 text-justify text-lg text-zinc-300 md:text-xl">
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

          <div className="h-[3dvh] w-full bg-gradient-to-b from-zinc-900 to-transparent" />

          <div className="flex max-w-3xl flex-col items-center justify-center space-y-2 p-5 shadow-lg">
            <h3 className="mb-5 text-2xl font-semibold text-white md:text-3xl">
              Learn more
            </h3>
            <ul className="flex flex-col items-start space-y-2 pb-5 text-justify text-lg text-zinc-300 md:text-xl">
              <li>
                <b>Documentation.</b> You can view all of the available features
                on the{" "}
                <a
                  className="text-blue-400 hover:underline"
                  href="/wiki"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  wiki
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

          <div className="flex h-[2px] w-full flex-row items-center justify-center">
            <hr className="my-8 h-[2px] w-1/2 border-0 bg-gradient-to-r from-transparent to-zinc-800" />
            <hr className="my-8 h-[2px] w-1/2 border-0 bg-gradient-to-l from-transparent to-zinc-800" />
          </div>

          <div className="flex max-w-2xl flex-col items-center justify-center space-y-2 p-5 shadow-lg">
            <h3 className="mb-5 text-2xl font-semibold text-white md:text-3xl">
              Contact us
            </h3>
            <p className="pb-5 text-lg text-zinc-300 md:text-xl">
              To report bugs, use either{" "}
              <a
                className="text-blue-400 hover:underline"
                href="https://github.com/PetrIvan/chord-seq-ai-app/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Issues
              </a>{" "}
              or contact me by{" "}
              <a
                className="text-blue-400 hover:underline"
                href="mailto:petr.ivan.junior@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                mail
              </a>
              . You can request features or vote for the next ones on{" "}
              <a
                className="text-blue-400 hover:underline"
                href="https://github.com/PetrIvan/chord-seq-ai-app/discussions/categories/feature-requests?discussions_q=category%3A%22Feature+requests%22+sort%3Atop"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Discussions
              </a>
              .
            </p>

            <p className="pb-5 text-lg text-zinc-300 md:text-xl">
              If you want to support the development of this app, you can do so
              on{" "}
              <TrackedLink
                href="https://patreon.com/XenoMuse"
                className="text-blue-400 hover:underline"
                event="patreon-link"
              >
                Patreon
              </TrackedLink>
              , or if you prefer a one-time donation, you can use{" "}
              <TrackedLink
                href="https://paypal.me/XenoMuse"
                className="text-blue-400 hover:underline"
                event="paypal-link"
              >
                PayPal
              </TrackedLink>
              .
            </p>
          </div>

          {/* Social icons*/}
          <div className="flex max-h-20 max-w-96 flex-row items-center justify-center space-x-[6%] px-5 pb-5 md:pb-0">
            <a
              href="https://www.youtube.com/@xenomuse-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="h-full w-full"
            >
              <Image
                src="/youtube-logo.svg"
                alt="YouTube channel"
                className="h-full w-full"
                width={100}
                height={100}
              />
            </a>
            <a
              href="https://github.com/PetrIvan/chord-seq-ai-app"
              target="_blank"
              rel="noopener noreferrer"
              className="h-full w-full"
            >
              <Image
                src="/github-logo.svg"
                alt="GitHub repository"
                className="h-full w-full p-[10%] brightness-0 invert filter"
                width={98}
                height={96}
              />
            </a>
            <a
              href="https://www.facebook.com/xenomuse.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="h-full w-full"
            >
              <Image
                src="/facebook-logo.png"
                alt="Facebook page"
                className="h-full w-full p-[10%]"
                width={100}
                height={100}
              />
            </a>
            <a
              href="https://www.reddit.com/user/XenoMuseDev"
              target="_blank"
              rel="noopener noreferrer"
              className="h-full w-full"
            >
              <Image
                src="/reddit-logo.svg"
                alt="Reddit profile"
                className="h-full w-full brightness-0 invert filter"
                width={100}
                height={100}
              />
            </a>
            <TrackedLink
              href="https://patreon.com/XenoMuse"
              className="h-full w-full"
              event="patreon-icon"
            >
              <Image
                src="/patreon-logo.svg"
                alt="Support us on Patreon"
                className="h-full w-full p-[10%]"
                width={100}
                height={100}
              />
            </TrackedLink>
            <TrackedLink
              href="https://paypal.me/XenoMuse"
              className="h-full w-full"
              event="paypal-icon"
            >
              <Image
                src="/paypal-logo.png"
                alt="Support us on PayPal"
                className="h-full w-full"
                width={100}
                height={100}
              />
            </TrackedLink>
          </div>
        </div>
      </div>
    </div>
  );
}
