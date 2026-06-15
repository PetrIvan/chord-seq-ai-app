import { useSyncExternalStore, useEffect } from "react";
import { getSelectorsByUserAgent } from "react-device-detect";

// These hooks read browser-only environment values (window size, user agent) in
// an SSR-safe way via useSyncExternalStore. Compared to the useState + useEffect
// pattern, they avoid synchronously setting state inside an effect (which can
// trigger cascading renders) while still rendering correct values after mount.

function subscribeToResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

// Returns the current window aspect ratio (width / height), updating on resize.
// `serverFallback` is used during SSR/prerender where `window` is unavailable.
export function useAspectRatio(serverFallback: number): number {
  return useSyncExternalStore(
    subscribeToResize,
    () => window.innerWidth / window.innerHeight,
    () => serverFallback,
  );
}

// The custom scrollbar is disabled on Firefox and mobile (where it looks worse
// than the native one). The decision depends on the user agent, so it is only
// known on the client; SSR assumes it is enabled.
function isCustomScrollbarSupported(): boolean {
  const userAgent = navigator.userAgent;
  return !(/Firefox/i.test(userAgent) || getSelectorsByUserAgent(userAgent).isMobile);
}

// The user agent does not change after mount, so there is nothing to subscribe
// to; the snapshot is read once on the client.
const noopSubscribe = () => () => {};

export function useCustomScrollbar(): boolean {
  const enabled = useSyncExternalStore(
    noopSubscribe,
    isCustomScrollbarSupported,
    () => true,
  );

  useEffect(() => {
    document.body.classList.add("custom-scrollbar");

    if (!enabled) {
      // Remove the custom-scrollbar class from all elements that opted in.
      document.querySelectorAll(".custom-scrollbar").forEach((element) => {
        element.classList.remove("custom-scrollbar");
      });
    }
  }, [enabled]);

  return enabled;
}
