import { useStore } from "@/state/use_store";

export default function Decay() {
  const [decayFactor, setDecayFactor] = useStore((state) => [
    state.decayFactor,
    state.setDecayFactor,
  ]);

  function handleDecayFactorChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDecayFactor(parseFloat(e.target.value));

    const value = Number(e.target.value);
    const max = Number(e.target.max);
    const min = Number(e.target.min);

    // Offset to adjust the slider color to the thumb
    // For 50% it stays the same, for 0% and 100% it's 7% further (7% and 93%)
    let offset = 0.07;
    const percentage =
      (((value - min) / (max - min)) * (1 - 2 * offset) + offset) * 100;

    e.target.style.background = `linear-gradient(to right, #5b21b6 ${percentage}%, #27272a ${percentage}%)`;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <label htmlFor="decay" className="text-white text-[2.5dvh] mb-[0.5dvw]">
        Decay
      </label>
      <input
        id="decay"
        className="w-[16dvh] h-[2dvh] bg-zinc-800 rounded-full appearance-none cursor-pointer accent-violet-800 range-slider"
        type="range"
        style={{
          background: `linear-gradient(to right, #5b21b6 50%, #27272a 50%)`,
        }}
        min={3}
        max={9}
        step={0.5}
        value={decayFactor}
        onChange={handleDecayFactorChange}
      />
    </div>
  );
}
