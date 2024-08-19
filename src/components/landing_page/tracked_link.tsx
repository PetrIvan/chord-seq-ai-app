"use client";

export default function TrackedLink({
  href,
  children,
  className,
  event,
}: {
  href: string;
  children: React.ReactNode;
  className: string;
  event: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        try {
          (globalThis as any).umami.track(event);
        } catch {
          console.error("Failed to track event");
        }
      }}
    >
      {children}
    </a>
  );
}
