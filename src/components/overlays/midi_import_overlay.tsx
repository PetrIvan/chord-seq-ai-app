"use client";
import { useEffect, useState, useRef } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";

import Select from "../ui/select";
import Overlay from "../ui/overlay";

import { getChordsFromNotes } from "@/playback/midi_io";

export default function MidiImportOverlay() {
  const [
    isMidiImportOverlayOpen,
    setIsMidiImportOverlayOpen,
    midiFile,
    setChords,
    setSignature,
    setBpm,
    customScrollbarEnabled,
    setEnabledShortcuts,
    setSelectedChord,
  ] = useStore(
    (state) => [
      state.isMidiImportOverlayOpen,
      state.setIsMidiImportOverlayOpen,
      state.midiFile,
      state.setChords,
      state.setSignature,
      state.setBpm,
      state.customScrollbarEnabled,
      state.setEnabledShortcuts,
      state.setSelectedChord,
    ],
    shallow,
  );

  const [tracks, setTracks] = useState(
    midiFile.tracks.filter((track) => track.notes.length > 0),
  );

  const tracksRef = useRef(tracks);
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  const [includedTracks, setIncludedTracks] = useState<Array<boolean>>(
    new Array(tracks.length).fill(true),
  );

  const [quantization, setQuantization] = useState<number>(1);
  const [quantizationMode, setQuantizationMode] = useState<string>("closest");
  const [importBpm, setImportBpm] = useState<boolean>(true);

  // Update the tracks and quantization when the MIDI file changes
  useEffect(() => {
    if (midiFile.tracks.length === 0) return;

    // Filter out tracks with no notes
    let tempTracks = midiFile.tracks.filter((track) => track.notes.length > 0);
    setTracks(tempTracks);

    // Include only tracks that are not percussion
    let tempIncludedTracks = new Array(tempTracks.length);
    for (let i = 0; i < tempTracks.length; i++) {
      tempIncludedTracks[i] = !tempTracks[i].instrument.percussion;
    }

    setIncludedTracks(tempIncludedTracks);

    // Set the default quantization
    let defaultQuantization = 4;
    if (midiFile.header.timeSignatures.length > 0)
      defaultQuantization = midiFile.header.timeSignatures[0].timeSignature[0];

    setQuantization(defaultQuantization);
  }, [midiFile]);

  // Main function to import the MIDI file
  const importMidi = (
    includedTracks: boolean[],
    quantization: number,
    importBpm: boolean,
    quantizationMode: string,
  ) => {
    if (tracksRef.current.length > 0) {
      if (includedTracks.every((t) => !t))
        throw new Error("Please select at least one track to import.");

      setSelectedChord(-1);

      // Extract the chords from the MIDI file
      const notes = tracksRef.current
        .filter((_, i) => includedTracks[i])
        .flatMap((track) =>
          track.notes?.map((note) => ({
            name: note.name,
            duration: note.durationTicks / midiFile.header.ppq,
            time: note.ticks / midiFile.header.ppq,
          })),
        );

      const chords = getChordsFromNotes(notes, quantization, quantizationMode);
      setChords(chords);

      // Set the time signature and BPM
      if (midiFile.header.timeSignatures.length > 0) {
        const signature = midiFile.header.timeSignatures[0].timeSignature;
        setSignature([signature[0], signature[1]]);
      }

      let bpm = 120;
      if (midiFile.header.tempos.length > 0)
        bpm = Math.round(midiFile.header.tempos[0].bpm);
      if (importBpm) {
        setBpm(bpm);
      }

      setIsMidiImportOverlayOpen(false);
      setEnabledShortcuts(true);
    }
  };

  const otherShortcuts = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();

      try {
        importMidi(includedTracks, quantization, importBpm, quantizationMode);
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  return (
    <Overlay
      isOverlayOpen={isMidiImportOverlayOpen}
      setIsOverlayOpen={setIsMidiImportOverlayOpen}
      enabledOverflow={false}
      otherShortcuts={otherShortcuts}
    >
      <p className="w-full px-[1dvh] text-center text-[5dvh] font-semibold">
        Import MIDI
      </p>
      <div className="flex w-full flex-row flex-wrap items-center justify-between">
        <div className="flex flex-row items-center justify-start space-x-[2dvh] p-[1dvw]">
          <label className="whitespace-nowrap" htmlFor="quantization">
            Quantization (beats):
          </label>
          <input
            id="quantization"
            type="number"
            title="Beats"
            className="mr-[1dvw] h-[6dvh] w-[10dvh] rounded-[1dvh] border-[0.2dvh] bg-zinc-800 p-[1dvh] text-[2.5dvh]"
            min={1}
            max={8}
            step={1}
            value={quantization}
            onChange={(e) => {
              setQuantization(parseInt(e.target.value));
            }}
          />
        </div>
        <div className="flex flex-row items-center justify-center space-x-[2dvh] p-[1dvw]">
          <label className="whitespace-nowrap">Quantization mode:</label>
          <Select
            selectName="quantization mode"
            state={quantizationMode}
            setState={setQuantizationMode}
            allStates={["closest", "all notes"]}
            width="17dvh"
          />
        </div>
        <div className="flex flex-row items-center justify-end space-x-[2dvh] p-[1dvw]">
          <label className="whitespace-nowrap" htmlFor="tempo">
            Import BPM:
          </label>
          <input
            id="tempo"
            type="checkbox"
            className="h-[2.4dvh] w-[2.4dvh] rounded-[0.5dvh] border-[0.2dvh] bg-zinc-800 focus:outline-none"
            checked={importBpm}
            onChange={() => {
              setImportBpm(!importBpm);
            }}
          />
        </div>
      </div>

      <p className="w-full px-[1dvh] text-center font-semibold">
        Select harmony tracks:
      </p>
      <ul
        className={
          `left-0 max-h-[40%] w-full overflow-y-auto rounded-[0.5dvw] ` +
          `${
            customScrollbarEnabled
              ? "scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700 scrollbar-track-rounded-full scrollbar-thumb-rounded-full hover:scrollbar-thumb-zinc-600 active:scrollbar-thumb-zinc-500"
              : ""
          }`
        }
      >
        {tracks.map((track, i) => (
          <li
            className="flex w-full min-w-0 flex-1 items-center justify-between whitespace-nowrap rounded-[0.5dvw] p-[2dvh] hover:bg-zinc-800"
            title={`Include ${track.name}`}
            onClick={() => {
              setIncludedTracks(
                includedTracks.map((t, j) => (i === j ? !t : t)),
              );
            }}
            key={i}
          >
            <label className="truncate" htmlFor={`track-${i}`}>
              {track.name || "Unnamed"} (sounds like {track.instrument.name})
            </label>
            <div className="flex flex-row items-center justify-between space-x-[1dvw]">
              <input
                id={`track-${i}`}
                type="checkbox"
                className="h-[2.4dvh] w-[2.4dvh] rounded-[0.5dvh] border-[0.2dvh] bg-zinc-800 focus:outline-none"
                checked={includedTracks[i]}
                onChange={() => {
                  setIncludedTracks(
                    includedTracks.map((t, j) => (i === j ? !t : t)),
                  );
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="flex w-full flex-row justify-evenly">
        <button
          className="flex max-h-[10dvh] flex-row items-center justify-center space-x-[0.4dvh] rounded-[1dvh] bg-zinc-800 p-[2dvh] filter hover:brightness-110 hover:filter active:brightness-90"
          title="Import (Enter)"
          onClick={() => {
            try {
              importMidi(
                includedTracks,
                quantization,
                importBpm,
                quantizationMode,
              );
            } catch (e: any) {
              alert(e.message);
            }
          }}
        >
          Import
        </button>
      </div>
    </Overlay>
  );
}
