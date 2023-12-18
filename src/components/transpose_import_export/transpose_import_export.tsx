"use client";
import { useState, useRef, useEffect } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import { cloneDeep } from "lodash";

import { transpositionMap } from "@/data/transposition_map";
import {
  getMidiBlob,
  extractMidiNotes,
  getChordsFromNotes,
} from "@/playback/midi_io";

import TransposeDropdown from "./transpose_dropdown";
import ExportDropdown from "./export_dropdown";

export default function TransposeImportExport() {
  const [chords, setChords, signature, setSignature, setSelectedChord] =
    useStore(
      (state) => [
        state.chords,
        state.setChords,
        state.signature,
        state.setSignature,
        state.setSelectedChord,
      ],
      shallow
    );

  /* Transposition */
  function transposeChords(delta: number) {
    if (delta === 0) return;
    if (delta < 0) delta += 12;
    delta %= 12;

    const newChords = chords.map((chord) => {
      if (chord.token === -1) return chord;

      let newChord = cloneDeep(chord);
      newChord.token = transpositionMap[chord.token][delta];
      return newChord;
    });

    setChords(newChords);
  }

  // Transposition dropdown
  const [showTransposeDropdown, setShowTransposeDropdown] = useState(false);
  const showTransposeDropdownRef = useRef(showTransposeDropdown);

  const transposeDropdownRef = useRef<HTMLDivElement>(null);
  const openTransposeDropdownButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    showTransposeDropdownRef.current = showTransposeDropdown;
  }, [showTransposeDropdown]);

  useEffect(() => {
    // Hide the dropdown on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showTransposeDropdownRef.current &&
        !transposeDropdownRef.current?.contains(e.target as Node) &&
        !openTransposeDropdownButtonRef.current?.contains(e.target as Node)
      ) {
        setShowTransposeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* Import */
  const importRef = useRef<HTMLInputElement>(null);

  // Import based on file format
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [prevChords, prevSignature] = [chords, signature];
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }

    if (fileObj.name.endsWith(".chseq")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          const importedChords = data.chords;
          const importedSignature = data.signature;

          // Assert that the imported chords are valid
          if (
            !Array.isArray(importedChords) ||
            importedChords.some(
              (chord: any) =>
                typeof chord.index !== "number" ||
                typeof chord.token !== "number" ||
                typeof chord.duration !== "number" ||
                typeof chord.variant !== "number"
            )
          ) {
            throw new Error();
          }

          for (let i = 0; i < importedChords.length; i++) {
            if (
              importedChords[i].index !== i ||
              importedChords[i].token > transpositionMap.length ||
              importedChords[i].token < -1 ||
              importedChords[i].duration < 0 ||
              importedChords[i].variant < 0
            ) {
              throw new Error();
            }
          }

          // Assert that the imported signature is valid
          if (
            !Array.isArray(importedSignature) ||
            importedSignature.length !== 2 ||
            typeof importedSignature[0] !== "number" ||
            typeof importedSignature[1] !== "number" ||
            importedSignature[0] < 2 ||
            importedSignature[0] > 16 ||
            importedSignature[1] < 1 ||
            importedSignature[1] > 32
          ) {
            throw new Error();
          }

          setSelectedChord(-1);
          setChords(importedChords as typeof chords);
          setSignature(importedSignature as typeof signature);
        } catch (error) {
          setChords(prevChords);
          setSignature(prevSignature);
          alert("Couldn't parse the file.");
        }
      };
      reader.readAsText(fileObj);
    }

    if (fileObj.name.endsWith(".mid")) {
      extractMidiNotes(fileObj)
        .then((notes) => {
          setChords(getChordsFromNotes(notes));
        })
        .catch((error) => {
          setChords(prevChords);
          alert(
            "An error occurred while importing the MIDI file. Ensure that it contains a single track with non-overlapping chords."
          );
        });
    }
  };

  /* Export */
  function downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Export given the format
  function handleExport(format: string) {
    if (format === ".chseq") {
      const jsonData = JSON.stringify({ chords: chords, signature: signature });
      const blob = new Blob([jsonData], { type: "application/json" });

      downloadFile(blob, "chords.chseq");
    }
    if (format === ".mid") {
      const blob = getMidiBlob(chords);

      downloadFile(blob, "chords.mid");
    }
  }

  // Export dropdown
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const showExportDropdownRef = useRef(showExportDropdown);

  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const openExportDropdownButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    showExportDropdownRef.current = showExportDropdown;
  }, [showExportDropdown]);

  useEffect(() => {
    // Hide the dropdown on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showExportDropdownRef.current &&
        !exportDropdownRef.current?.contains(e.target as Node) &&
        !openExportDropdownButtonRef.current?.contains(e.target as Node)
      ) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="relative flex-1 bg-zinc-900 p-[2dvh] rounded-[0.5dvw] w-full flex flex-row justify-evenly text-[2.5dvh]">
      <button
        className="grow select-none filter active:brightness-90 flex flex-col justify-center items-center"
        title="Transpose"
        onClick={() => setShowTransposeDropdown(!showTransposeDropdown)}
        ref={openTransposeDropdownButtonRef}
      >
        <img src="/transpose.svg" alt="Transpose" className="h-full w-full" />
      </button>
      <button
        className="grow select-none filter active:brightness-90 flex flex-col justify-center items-center"
        title="Import (.chseq, .mid)"
        onClick={() => importRef.current?.click()}
      >
        <img src="/import.svg" alt="Import" className="h-full w-full" />
        <input
          type="file"
          className="hidden"
          accept=".chseq,.mid"
          ref={importRef}
          onChange={handleFileChange}
        />
      </button>
      <button
        className="grow select-none filter active:brightness-90 flex flex-col justify-center items-center"
        title="Export"
        onClick={() => setShowExportDropdown(!showExportDropdown)}
        ref={openExportDropdownButtonRef}
      >
        <img src="/export.svg" alt="Export" className="h-full w-full" />
      </button>
      {/* Dropdowns */}
      {showTransposeDropdown && (
        <TransposeDropdown
          transpose={transposeChords}
          dropdownRef={transposeDropdownRef}
        />
      )}
      {showExportDropdown && (
        <ExportDropdown
          dropdownRef={exportDropdownRef}
          setIsExportDropdownOpen={setShowExportDropdown}
          handleExport={handleExport}
        />
      )}
    </section>
  );
}
