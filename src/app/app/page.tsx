import { headers } from "next/headers";
import { getSelectorsByUserAgent } from "react-device-detect";

import dynamic from "next/dynamic";
import LoadingScreen from "@/components/loading_screen";
import MobileScreen from "@/components/mobile_screen";

const App = dynamic(() => import("@/components/app"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function Page() {
  // Next.js 13+ implementation, the default isMobile from react-device-detect
  // is not working anymore (see https://stackoverflow.com/a/77174374/3058839)
  const { isMobile } = getSelectorsByUserAgent(
    headers().get("user-agent") ?? ""
  );

  if (isMobile) {
    return <MobileScreen />;
  }

  return <App />;
}
