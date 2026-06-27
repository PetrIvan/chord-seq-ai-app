"use client";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import { useInit } from "@/state/use_init";

import Image from "next/image";

import Overlay from "../ui/overlay";
import TrackedLink from "../landing_page/tracked_link";

export default function PromoOverlay() {
  const [
    welcomeFirstTime,
    promoVersion,
    setPromoVersion,
    isPromoOverlayOpen,
    setIsPromoOverlayOpen,
  ] = useStore(
    (state) => [
      state.welcomeFirstTime,
      state.promoVersion,
      state.setPromoVersion,
      state.isPromoOverlayOpen,
      state.setIsPromoOverlayOpen,
    ],
    shallow,
  );

  // Bump this and replace the content below to show a new promo
  const latestPromoVersion = 0;

  // For existing users, show an unseen promo right away
  useInit(() => {
    if (promoVersion < latestPromoVersion && !welcomeFirstTime) {
      setIsPromoOverlayOpen(true);
      setPromoVersion(latestPromoVersion);
    }
  });

  return (
    <Overlay
      isOverlayOpen={isPromoOverlayOpen}
      setIsOverlayOpen={setIsPromoOverlayOpen}
    >
      <p className="w-full px-[1dvh] text-center text-[5dvh] font-semibold">
        Promo title
      </p>
      <p className="max-w-[85%] text-center text-[2.5dvh]">Promo description</p>
      <Image
        src="/promo.webp"
        alt="Promo"
        width={1920}
        height={1080}
        className="h-[min(40dvh,_30dvw)] max-w-[85%] rounded-lg object-contain py-[2.5dvh] shadow-lg"
      />
      <TrackedLink
        href="https://example.com"
        className="inline-block rounded-full bg-white px-[2.5dvh] py-[1dvh] text-[2.2dvh] font-semibold text-zinc-950 shadow-md transition-transform duration-200 ease-in-out hover:scale-105 hover:bg-zinc-200"
        event="promo-cta"
      >
        Promo call to action
      </TrackedLink>
    </Overlay>
  );
}
