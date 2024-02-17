"use client";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

export default function SupportUsOverlay() {
  const [isSupportUsOverlayOpen, setIsSupportUsOverlayOpen] = useStore(
    (state) => [state.isSupportUsOverlayOpen, state.setIsSupportUsOverlayOpen],
    shallow
  );

  return (
    <>
      {isSupportUsOverlayOpen && (
        <div className="fixed inset-0 z-40 bg-zinc-950 bg-opacity-50 flex flex-col items-center justify-center">
          <div className="relative bg-zinc-900 h-[80dvh] w-[70dvw] rounded-lg flex flex-col items-center justify-evenly p-[1dvw]">
            <div className="flex-1 w-full flex flex-col items-center justify-center space-y-[2dvh] mb-[5dvh]">
              <img
                className="absolute top-2 right-2 w-10 h-10 cursor-pointer"
                src="/close.svg"
                title="Close"
                onClick={() => setIsSupportUsOverlayOpen(false)}
              />
              <div className="text-center">
                <p className="text-2xl lg:text-4xl font-semibold mb-8 px-16">
                  Which way would you like to support us?
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <a
                    href="https://paypal.me/xenomuse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center bg-zinc-800 p-8 rounded-lg transition hover:bg-zinc-700"
                  >
                    <p className="text-xl mb-3 whitespace-nowrap">
                      One-time donation
                    </p>
                    <p className="text-3xl font-medium">PayPal</p>
                  </a>
                  <a
                    href="https://patreon.com/xenomuse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center bg-zinc-800 p-8 rounded-lg transition hover:bg-zinc-700"
                  >
                    <p className="text-xl mb-3 whitespace-nowrap">
                      Monthly subscription
                    </p>
                    <p className="text-3xl font-medium">Patreon</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
