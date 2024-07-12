import Select from "../ui/select";

interface Props {
  dropdownRef: React.RefObject<HTMLDivElement>;
  setIsExportDropdownOpen: (state: boolean) => void;
  handleExport: (format: string) => void;
  format: string;
  setFormat: (format: string) => void;
}

export default function ExportDropdown({
  dropdownRef,
  handleExport,
  setIsExportDropdownOpen,
  format,
  setFormat,
}: Props) {
  return (
    <div
      className="absolute text-[2.5dvh] z-10 top-full mt-[0.5dvw] bg-zinc-950 rounded-[0.5dvw] flex flex-row items-center justify-between p-[1dvw] shadow-lg shadow-zinc-950"
      ref={dropdownRef}
    >
      <span className="select-none mr-[1dvw]">Format:</span>
      <Select
        selectName="format"
        state={format}
        setState={setFormat}
        allStates={[".chseq", ".mid"]}
        width="15dvh"
        enabledShortcuts={true}
        onDark={true}
      />
      <button
        className="bg-zinc-800 rounded-[0.5dvw] p-[0.5dvw] hover:bg-zinc-900"
        title="Export (Enter)"
        onClick={() => {
          handleExport(format);
          setIsExportDropdownOpen(false);
        }}
      >
        Export
      </button>
    </div>
  );
}
