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
    customScrollbarEnabled,
    isStepByStepTutorialOpen,
    tutorialStep,
  ] = useStore(
    (state) => [
      state.selectedGenres,
      state.setSelectedGenres,
      state.selectedDecades,
      state.setSelectedDecades,
      state.customScrollbarEnabled,
      state.isStepByStepTutorialOpen,
      state.tutorialStep,
    ],
    shallow,
  );

  // Turn on/off style
  function switchSelected(
    i: number,
    selectedList: number[],
    setList: (list: number[]) => void,
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
    setList: (list: number[]) => void,
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
      <div
        className={
          `absolute left-0 top-[100%] z-20 max-h-[50dvh] w-full overflow-auto rounded-[0.5dvw] bg-zinc-900 shadow-lg shadow-zinc-950 ` +
          `${
            customScrollbarEnabled
              ? "scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700 scrollbar-track-rounded-full scrollbar-thumb-rounded-full hover:scrollbar-thumb-zinc-600 active:scrollbar-thumb-zinc-500"
              : ""
          }`
        }
      >
        {list.map((item, i) => (
          <ul key={i} className="">
            <li>
              <div
                className="flex w-full min-w-0 flex-1 grow-[2] items-center justify-between whitespace-nowrap rounded-[0.5dvw] p-[1dvw] hover:bg-zinc-800"
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
                    className="h-[2.4dvh] w-[2.4dvh] rounded-[0.5dvh] border-[0.2dvh] bg-zinc-800 focus:outline-none"
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
                    className="h-[6dvh] w-[12dvh] rounded-[0.5dvh] border-[0.2dvh] bg-zinc-800 p-[1dvh] text-[2.5dvh] text-white"
                    value={selectedList[i] || ""}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      changeSelected(
                        i,
                        Math.max(parseFloat(e.target.value), 0),
                        selectedList,
                        setSelected,
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
      className="absolute left-0 top-[100%] z-20 flex w-full flex-row items-stretch justify-center rounded-[0.5dvw] bg-zinc-900 text-center shadow-lg"
      style={{
        zIndex: isStepByStepTutorialOpen && tutorialStep === 7 ? "150" : "",
      }}
      ref={styleDropdownRef}
    >
      {/* Tab selection */}
      <button
        className={`flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-l-[0.5dvw] p-[1dvw] active:bg-zinc-800 ${
          selectedTab === "genres" ? "" : "bg-zinc-950"
        }`}
        onClick={() => setSelectedTab("genres")}
      >
        Genres
      </button>
      <button
        className={`flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-r-[0.5dvw] p-[1dvw] active:bg-zinc-800 ${
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
