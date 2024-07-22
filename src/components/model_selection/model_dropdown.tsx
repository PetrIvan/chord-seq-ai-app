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
        `absolute z-20 bg-zinc-900 left-0 w-full rounded-[1dvh] top-[100%] shadow-lg shadow-zinc-950 overflow-auto max-h-[50dvh] ` +
        `${
          customScrollbarEnabled
            ? "scrollbar-thin scrollbar-track-zinc-800 scrollbar-track-rounded-full scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600 active:scrollbar-thumb-zinc-500 scrollbar-thumb-rounded-full"
            : ""
        }`
      }
      ref={modelDropdownRef}
    >
      <ul>
        {models.map((model, i) => (
          <li key={i}>
            <button
              className="flex-1 grow-[2] w-full flex justify-center items-center p-[2dvh] min-w-0 whitespace-nowrap active:bg-zinc-700 hover:bg-zinc-800 rounded-[1dvh] truncate"
              title="Change model"
              onClick={() => {
                setSelectedModel(i);
                setShowModelDropdown(false);
              }}
            >
              <div className="relative flex flex-row items-center justify-center w-full">
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
