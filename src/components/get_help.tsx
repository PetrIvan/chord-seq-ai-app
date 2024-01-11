export default function GetHelp() {
  return (
    <section className="flex-1 grow-[0.2] bg-zinc-900 p-[2dvh] rounded-[0.5dvw] w-full flex flex-row justify-evenly text-[2.5dvh]">
      <button
        className="grow select-none filter active:brightness-90 flex flex-col justify-center items-center"
        title="Open documentation"
        onClick={() =>
          window.open(
            "https://github.com/PetrIvan/chord-seq-ai-app/wiki",
            "_blank"
          )
        }
      >
        <img src="/get-help.svg" alt="?" className="h-full w-full" />
      </button>
    </section>
  );
}
