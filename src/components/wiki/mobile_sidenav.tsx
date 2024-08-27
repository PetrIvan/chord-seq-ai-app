import Image from "next/image";
import Sidenav from "./sidenav";

interface Props {
  isSidenavOpen: boolean;
  setIsSidenavOpen: (value: boolean) => void;
  customScrollbarEnabled: boolean;
  pagePath: string;
}

export default function MobileSidenav({
  isSidenavOpen,
  setIsSidenavOpen,
  customScrollbarEnabled,
  pagePath,
}: Props) {
  return (
    isSidenavOpen && (
      <div
        className="lg:hidden fixed top-0 h-screen w-screen z-50 bg-zinc-950/50"
        onClick={() => setIsSidenavOpen(false)}
      >
        {/* Background blur */}
        <div className="pl-64 w-full h-full z-40">
          <div className="w-full h-full backdrop-blur-sm" />
        </div>

        <Sidenav
          className="z-50 bg-zinc-900"
          customScrollbarEnabled={customScrollbarEnabled}
          currentPath={`/wiki${pagePath}`}
          onClick={(e: any) => e.stopPropagation()}
        >
          <Image
            src="/close.svg"
            alt=""
            className="absolute top-6 right-4 h-5 w-5 cursor-pointer"
            width={100}
            height={100}
            onClick={() => setIsSidenavOpen(false)}
          />
        </Sidenav>
      </div>
    )
  );
}
