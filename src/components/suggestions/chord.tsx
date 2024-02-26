import { useEffect, useRef } from "react";
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
    isVariantsOpenFromSuggestions: boolean
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
  // Open variants on right click
  const chordElementRef = useRef<HTMLButtonElement>(null);
  const tokenRef = useRef(token);
  const variantRef = useRef(variant);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    variantRef.current = variant;
  }, [variant]);

  useEffect(() => {
    const element = chordElementRef.current;
    if (!element) return;

    const handleContextMenu = (e: MouseEvent) => {
      if (tokenRef.current === -1) return;

      e.preventDefault();
      if (e.button === 2) {
        setSelectedToken(tokenRef.current);
        setSelectedVariant(variantRef.current);
        setIsVariantsOpenFromSuggestions(true);
        setVariantsOpen(true);
      }
    };

    element.addEventListener("contextmenu", handleContextMenu);

    return () => {
      element.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <button
      className="flex flex-row justify-center items-center space-x-[0.2dvw] p-[1dvw] rounded-[0.5dvw] w-full overflow-hidden outline-none filter active:brightness-90 hover:filter hover:brightness-110 max-h-[5dvw]"
      style={{
        // Interpolate between violet and black logarithmically
        backgroundColor: color(
          1 - (Math.log(prob + Number.EPSILON) + decayFactor) / decayFactor
        ),
        minHeight: "5dvw",
      }}
      title={`Replace selected with ${tokenToChord[token][variant]} (${(
        prob * 100
      ).toFixed(2)}%${
        variant !== 0 ? `; variant of ${tokenToChord[token][0]}` : ""
      }${
        prob === 0 ? "; same as previous" : "" // The probability can be 0 only in that case (because of model's softmax function)
      }), right click to open variants`}
      onClick={() => {
        playChord(tokenToChord[token][variant]);
        replaceChord(token, variant);
      }}
      ref={chordElementRef}
    >
      {tokenToChord[token][variant]}
    </button>
  );
}
