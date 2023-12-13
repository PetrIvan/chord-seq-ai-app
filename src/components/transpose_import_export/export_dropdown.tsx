import { useState } from "react";

interface Props {
  dropdownRef: React.RefObject<HTMLDivElement>;
  setIsExportDropdownOpen: (state: boolean) => void;
  handleExport: (format: string) => void;
}

export default function ExportDropdown({
  dropdownRef,
  handleExport,
  setIsExportDropdownOpen,
}: Props) {
  const [format, setFormat] = useState(".chseq");

  // Format selection dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  let formatDropdown = (
    <div className="absolute z-[15] top-full mt-[0.5dvw] bg-zinc-800 rounded-[0.5dvw] w-full text-[2.5dvh]">
      <ul>
        {[".chseq", ".mid"].map((format) => (
          <li key={format}>
            <button
              className="w-full bg-zinc-800 rounded-[0.5dvw] p-[0.5dvw] hover:bg-zinc-900"
              onClick={() => {
                setFormat(format);
                setIsDropdownOpen(false);
              }}
            >
              {format}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div
      className="absolute text-[2.5dvh] z-10 top-full mt-[0.5dvw] bg-zinc-950 rounded-[0.5dvw] flex flex-row items-center justify-between p-[1dvw] shadow-lg shadow-zinc-950"
      ref={dropdownRef}
    >
      <span className="select-none mr-[1dvw]">Format:</span>
      <div
        className="bg-zinc-800 rounded-[0.5dvw] p-[0.5dvw] mr-[1dvw] hover:bg-zinc-900 w-[6dvw] cursor-pointer whitespace-nowrap"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {format}
        <svg
          className="w-[0.8dvw] h-[0.8dvw] ml-[0.5dvw] inline-block"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
        <div className="relative w-full h-full">
          {isDropdownOpen && formatDropdown}
        </div>
      </div>
      <button
        className="bg-zinc-800 rounded-[0.5dvw] p-[0.5dvw] hover:bg-zinc-900"
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
