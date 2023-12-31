import ModelSelection from "@/components/model_selection/model_selection";
import TransposeImportExport from "@/components/transpose_import_export/transpose_import_export";
import TimelineEditor from "@/components/timeline/timeline_editor";
import Suggestions from "@/components/suggestions/suggestions";
import VariantOverlay from "./variant_overlay";

export default function App() {
  return (
    <div
      className="relative max-h-screen flex flex-col bg-scroll bg-center bg-cover text-[2.5dvh]"
      style={{ backgroundImage: `url('/background.jpg')` }}
    >
      <VariantOverlay />
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
