import { useMediaQuery } from "react-responsive";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config";

const config = resolveConfig(tailwindConfig);
const breakpoints = config.theme.screens;

export const useBreakpoint = (breakpoint: keyof typeof breakpoints) => {
  const breakpointQuery = breakpoints[breakpoint];

  return useMediaQuery({ query: `(min-width: ${breakpointQuery})` });
};
