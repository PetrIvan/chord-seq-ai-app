interface Props {
  setSelectedModel: (model: number) => void;
  setShowModelDropdown: (show: boolean) => void;
  models: [string, string, number][];
  modelDropdownRef: React.RefObject<HTMLDivElement>;
  customScrollbarEnabled: boolean;
}

export default function modelDropdown({
  setSelectedModel,
  setShowModelDropdown,
  models,
  modelDropdownRef,
  customScrollbarEnabled,
}: Props) {
  return (
    <div
      className={
        `absolute left-0 top-[100%] z-20 max-h-[50dvh] w-full overflow-auto rounded-[1dvh] bg-zinc-900 shadow-lg shadow-zinc-950 ` +
        `${
          customScrollbarEnabled
            ? "scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700 scrollbar-track-rounded-full scrollbar-thumb-rounded-full hover:scrollbar-thumb-zinc-600 active:scrollbar-thumb-zinc-500"
            : ""
        }`
      }
      ref={modelDropdownRef}
    >
      <ul>
        {models.map((model, i) => (
          <li key={i}>
            <button
              className="flex w-full min-w-0 flex-1 grow-[2] items-center justify-center truncate whitespace-nowrap rounded-[1dvh] p-[2dvh] hover:bg-zinc-800 active:bg-zinc-700"
              title="Change model"
              onClick={() => {
                setSelectedModel(i);
                setShowModelDropdown(false);
              }}
            >
              <div className="relative flex w-full flex-row items-center justify-center">
                <div>
                  {model[0]}{" "}
                  <span className="text-zinc-400">
                    ({model[2].toFixed(2)} MB
                    {model[0].includes("Conditional") ? "; style" : ""})
                  </span>
                </div>
                {model[0].includes("Conditional") && (
                  <span className="absolute right-0 mr-[1dvh]">✨</span>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
