"use client";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

export default function SupportUsButton() {
  const [setIsSupportUsOverlayOpen] = useStore(
    (state) => [state.setIsSupportUsOverlayOpen],
    shallow
  );

  return (
    <>
      <button
        className="max-md:hidden whitespace-nowrap flex items-center justify-center text-white py-7 px-6 text-2xl transition duration-300 ease-in-out hover:brightness-90 w-36 h-12"
        onClick={() => setIsSupportUsOverlayOpen(true)}
      >
        Support us
      </button>
    </>
  );
}
