import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import Image from "next/image";

export default function SearchBar() {
  const [setEnabledShortcuts, searchQuery, setSearchQuery] = useStore(
    (state) => [
      state.setEnabledShortcuts,
      state.searchQuery,
      state.setSearchQuery,
    ],
    shallow
  );

  return (
    <div className="h-[4dvw] bg-zinc-800 flex flex-row items-center justify-start rounded-[1dvw] p-[0.5dvw]">
      <div className="h-full flex flex-row items-center justify-end">
        <img className="w-[70%] h-[70%]" src="/search.svg" alt="Search" />
      </div>
      {/* Not actually visible, for accessibility */}
      <label htmlFor="search" className="visually-hidden">
        Search:
      </label>
      <input
        id="search"
        className="flex-1 h-full bg-zinc-800 text-white text-[1.2dvw] rounded-[1dvw] placeholder-zinc-500 placeholder-opacity-50 border-transparent focus:border-transparent focus:ring-0"
        type="text"
        placeholder="Search a chord..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        // Prevent shortcuts from being triggered when typing
        onFocus={() => setEnabledShortcuts(false)}
        onBlur={() => setEnabledShortcuts(true)}
      />
    </div>
  );
}
