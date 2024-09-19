import { useEffect } from "react";

export const useInit = (initCallback: () => void) => {
  useEffect(() => {
    initCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
