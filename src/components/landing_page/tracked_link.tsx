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
      onClick={() => (globalThis as any).umami.track(event)}
    >
      {children}
    </a>
  );
}
