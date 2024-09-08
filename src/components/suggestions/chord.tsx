import { useEffect, useRef, useState } from "react";
import { tokenToChord } from "@/data/token_to_chord";

// Interpolate between violet and black
const color = (t: number) => {
  const violet = [139, 92, 246];
  const black = [0, 0, 0];
  const r = violet[0] * (1 - t) + black[0] * t;
  const g = violet[1] * (1 - t) + black[1] * t;
  const b = violet[2] * (1 - t) + black[2] * t;
  return `rgb(${r}, ${g}, ${b})`;
};

interface Props {
  index: number;
  token: number;
  variant: number;
  prob: number;
  decayFactor: number;
  playChord: (chord: string) => void;
  replaceChord: (token: number, variant: number) => void;
  setSelectedToken: (token: number) => void;
  setSelectedVariant: (variant: number) => void;
  setVariantsOpen: (open: boolean) => void;
  setIsVariantsOpenFromSuggestions: (
    isVariantsOpenFromSuggestions: boolean,
  ) => void;
}

export default function Chord({
  token,
  variant,
  prob,
  decayFactor,
  playChord,
  replaceChord,
  setSelectedToken,
  setSelectedVariant,
  setVariantsOpen,
  setIsVariantsOpenFromSuggestions,
}: Props) {
  /* Variants */
  // Open variants on button click
  const tokenRef = useRef(token);
  const variantRef = useRef(variant);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    variantRef.current = variant;
  }, [variant]);

  /* Overflow left */
  const textRef = useRef<HTMLSpanElement>(null);

  const [alignDirection, setAlignDirection] = useState<"center" | "end">(
    "center",
  );

  return (
    <div
      className="group relative flex h-full w-full flex-row items-center justify-center space-x-[0.2dvw] overflow-hidden rounded-[0.5dvw] p-[1dvw] outline-none"
      onMouseEnter={() => {
        if (!textRef.current) return;

        if (textRef.current.scrollWidth > textRef.current.clientWidth) {
          setAlignDirection("end");
        } else {
          setAlignDirection("center");
        }
      }}
      onMouseLeave={() => setAlignDirection("center")}
    >
      <button
        className="absolute right-0 top-0 h-full w-full select-none rounded-[0.5dvh] outline-none filter hover:brightness-110 hover:filter active:brightness-90"
        style={{
          // Interpolate between violet and black logarithmically
          backgroundColor: color(
            1 - (Math.log(prob + Number.EPSILON) + decayFactor) / decayFactor,
          ),
        }}
        title={`Replace selected with ${tokenToChord[token][variant]} (${(
          prob * 100
        ).toFixed(2)}%${
          variant !== 0 ? `; variant of ${tokenToChord[token][0]}` : ""
        }${
          prob === 0 ? "; same as previous" : "" // The probability can be 0 only in that case (because of model's softmax function)
        })`}
        onClick={() => {
          playChord(tokenToChord[token][variant]);
          replaceChord(token, variant);
        }}
      >
        {/* Chord name - styling to handle overflow with the icon */}
        <div className="h-full w-full px-[6.5dvh]">
          <span
            className={`flex h-full w-full flex-row items-center whitespace-nowrap justify-${alignDirection}`}
            ref={textRef}
          >
            {tokenToChord[token][variant]}
          </span>
        </div>
      </button>

      <button
        className="invisible absolute right-[2dvh] z-10 flex h-[4dvh] w-[4dvh] select-none flex-col items-center justify-center filter group-hover:visible active:brightness-90"
        title="Open chord variants"
        onClick={() => {
          setSelectedToken(tokenRef.current);
          setSelectedVariant(variantRef.current);
          setIsVariantsOpenFromSuggestions(true);
          setVariantsOpen(true);
        }}
      >
        <img src="/variants.svg" alt="Variants" className="h-full w-full" />
      </button>
    </div>
  );
}
