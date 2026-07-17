/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// Serwist injects the list of build assets to precache into self.__SW_MANIFEST.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  // The app shell falls back to the prerendered landing page when offline and
  // a navigation request misses the cache.
  fallbacks: {
    entries: [
      {
        url: "/index.html",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// Turbopack passes dedicated-worker bootstrap data in the worker URL fragment.
// Fetch requests never include fragments, so responding to a worker request from
// the service worker (including with a cached or network response) makes
// Chromium start the worker without that data. Let the browser fetch worker
// entrypoints directly so their location retains the original #params value.
self.addEventListener("fetch", (event) => {
  if (event.request.destination === "worker") {
    event.stopImmediatePropagation();
  }
});

serwist.addEventListeners();
