interface Props {
  setSelectedModel: (model: number) => void;
  setShowModelDropdown: (show: boolean) => void;
  models: [string, string][];
  modelDropdownRef: React.RefObject<HTMLDivElement>;
}

export default function modelDropdown({
  setSelectedModel,
  setShowModelDropdown,
  models,
  modelDropdownRef,
}: Props) {
  return (
    <div
      className="absolute z-20 bg-zinc-900 left-0 w-full rounded-[0.5dvw] top-[100%] shadow-lg shadow-zinc-950 overflow-auto max-h-[50dvh]"
      ref={modelDropdownRef}
    >
      {models.map((model, i) => (
        <ul key={i} className="">
          <li>
            <button
              className="flex-1 grow-[2] w-full flex justify-center items-center p-[1dvw] min-w-0 whitespace-nowrap active:bg-zinc-700 hover:bg-zinc-800 rounded-[0.5dvw]"
              title="Change model"
              onClick={() => {
                setSelectedModel(i);
                setShowModelDropdown(false);
              }}
            >
              <p className="truncate">{model[0]}</p>
            </button>
          </li>
        </ul>
      ))}
    </div>
  );
}
