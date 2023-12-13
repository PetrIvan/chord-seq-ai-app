import dynamic from "next/dynamic";
import LoadingScreen from "@/components/loading_screen";

const App = dynamic(() => import("@/components/app"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function Page() {
  return <App />;
}
