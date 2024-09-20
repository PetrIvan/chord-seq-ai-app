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
      className="absolute top-full z-10 mt-[0.5dvw] flex flex-row items-center justify-between rounded-[0.5dvw] bg-zinc-950 p-[1dvw] text-[2.5dvh] shadow-lg shadow-zinc-950"
      ref={dropdownRef}
    >
      <span className="mr-[1dvw] select-none">Format:</span>
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
        className="rounded-[0.5dvw] bg-zinc-800 p-[0.5dvw] hover:bg-zinc-900"
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
