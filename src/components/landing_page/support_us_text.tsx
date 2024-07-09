"use client";

export default function SupportUsText() {
  return (
    <p className="md:hidden text-lg md:text-xl text-zinc-300 pb-5">
      If you want to support the development of this app, you can do so on{" "}
      <a
        className="text-blue-400 hover:underline"
        href="https://patreon.com/xenomuse"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => (globalThis as any).umami.track("patreon-link")}
      >
        Patreon
      </a>
      , or if you prefer a one-time donation, you can use{" "}
      <a
        className="text-blue-400 hover:underline"
        href="https://paypal.me/xenomuse"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => (globalThis as any).umami.track("paypal-link")}
      >
        PayPal
      </a>
      .
    </p>
  );
}
