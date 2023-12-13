import { headers } from "next/headers";
import { getSelectorsByUserAgent } from "react-device-detect";

import ModelSelection from "@/components/model_selection/model_selection";
import TransposeImportExport from "@/components/transpose_import_export/transpose_import_export";
import TimelineEditor from "@/components/timeline/timeline_editor";
import Suggestions from "@/components/suggestions/suggestions";
import MobileScreen from "@/components/mobile_screen";

export default function App() {
  // Next.js 13+ implementation, the default isMobile from react-device-detect
  // is not working anymore (see https://stackoverflow.com/a/77174374/3058839)
  const { isMobile } = getSelectorsByUserAgent(
    headers().get("user-agent") ?? ""
  );

  if (isMobile) {
    return <MobileScreen />;
  }

  return (
    <div
      className="max-h-screen flex flex-col bg-scroll bg-center bg-cover text-[2.5dvh]"
      style={{ backgroundImage: `url('/background.jpg')` }}
    >
      <div className="min-h-screen min-w-full grid grid-rows-[1fr_3fr_6fr] backdrop-blur-[2dvw] gap-[1dvw] p-[1dvw]">
        <div className="flex flex-row space-x-[1dvw] w-full min-h-0">
          <ModelSelection />
          <TransposeImportExport />
        </div>
        <TimelineEditor />
        <Suggestions />
      </div>
    </div>
  );
}
