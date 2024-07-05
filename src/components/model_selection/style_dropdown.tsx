import { useState } from "react";
import { useStore } from "@/state/use_store";
import { genres, decades } from "@/data/conditions";
import { shallow } from "zustand/shallow";

interface Props {
  styleDropdownRef: React.RefObject<HTMLDivElement>;
}

export default function StyleDropdown({ styleDropdownRef }: Props) {
  const [
    selectedGenres,
    setSelectedGenres,
    selectedDecades,
    setSelectedDecades,
  ] = useStore(
    (state) => [
      state.selectedGenres,
      state.setSelectedGenres,
      state.selectedDecades,
      state.setSelectedDecades,
    ],
    shallow
  );

  // Turn on/off style
  function switchSelected(
    i: number,
    selectedList: number[],
    setList: (list: number[]) => void
  ) {
    let newList = [...selectedList];
    newList[i] = newList[i] === 0 ? 1 : 0;
    setList(newList);
  }

  // Specific weight for style
  function changeSelected(
    i: number,
    newValue: number,
    selectedList: number[],
    setList: (list: number[]) => void
  ) {
    let newList = [...selectedList];
    newList[i] = newValue;
    setList(newList);
  }

  // Render dropdown based on tab
  const [selectedTab, setSelectedTab] = useState("genres");

  function dropdown() {
    const list =
      selectedTab === "genres" ? genres : decades.map((decade) => `${decade}s`);
    const selectedList =
      selectedTab === "genres" ? selectedGenres : selectedDecades;
    const setSelected =
      selectedTab === "genres" ? setSelectedGenres : setSelectedDecades;

    return (
      <div className="absolute z-20 bg-zinc-900 left-0 w-full rounded-[0.5dvw] top-[100%] shadow-lg shadow-zinc-950 overflow-auto max-h-[50dvh]">
        {list.map((item, i) => (
          <ul key={i} className="">
            <li>
              <div
                className="flex-1 grow-[2] w-full flex justify-between items-center p-[1dvw] min-w-0 whitespace-nowrap hover:bg-zinc-800 rounded-[0.5dvw]"
                title={`Change ${selectedTab}`}
                onClick={() => switchSelected(i, selectedList, setSelected)}
              >
                <label className="truncate" htmlFor={`style-param-${item}`}>
                  {item}
                </label>
                <div className="flex flex-row items-center justify-between space-x-[1dvw]">
                  <input
                    id={`style-param-${item}`}
                    type="checkbox"
                    className="h-[2.4dvh] w-[2.4dvh] border-[0.2dvh] bg-zinc-800 rounded-[0.5dvh] focus:outline-none"
                    checked={selectedList[i] !== 0}
                    onChange={() =>
                      switchSelected(i, selectedList, setSelected)
                    }
                  />
                  <label className="select-none" htmlFor={`weight-${item}`}>
                    Weight:
                  </label>
                  <input
                    id={`weight-${item}`}
                    type="number"
                    className="w-[12dvh] h-[6dvh] border-[0.2dvh] p-[1dvh] bg-zinc-800 text-white text-[2.5dvh] rounded-[0.5dvh]"
                    value={selectedList[i] || ""}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      changeSelected(
                        i,
                        Math.max(parseFloat(e.target.value), 0),
                        selectedList,
                        setSelected
                      );
                    }}
                  />
                </div>
              </div>
            </li>
          </ul>
        ))}
      </div>
    );
  }

  return (
    <div
      className="absolute z-20 left-0 w-full rounded-[0.5dvw] top-[100%] shadow-lg bg-zinc-900 flex flex-row items-stretch justify-center text-center"
      ref={styleDropdownRef}
    >
      {/* Tab selection */}
      <button
        className={`flex-1 flex justify-center items-center p-[1dvw] min-w-0 whitespace-nowrap active:bg-zinc-800 rounded-l-[0.5dvw] ${
          selectedTab === "genres" ? "" : "bg-zinc-950"
        }`}
        onClick={() => setSelectedTab("genres")}
      >
        Genres
      </button>
      <button
        className={`flex-1 flex justify-center items-center p-[1dvw] min-w-0 whitespace-nowrap active:bg-zinc-800 rounded-r-[0.5dvw] ${
          selectedTab === "decades" ? "" : "bg-zinc-950"
        }`}
        onClick={() => setSelectedTab("decades")}
      >
        Decades
      </button>
      {dropdown()}
    </div>
  );
}
