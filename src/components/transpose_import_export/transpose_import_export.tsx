"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useStore } from "@/state/use_store";
import { shallow } from "zustand/shallow";
import { cloneDeep } from "lodash";
import Image from "next/image";

import { transpositionMap } from "@/data/transposition_map";
import { getMidiBlob, extractMidiFile } from "@/playback/midi_io";

import TransposeDropdown from "./transpose_dropdown";
import ExportDropdown from "./export_dropdown";

export default function TransposeImportExport() {
  const [
    chords,
    setChords,
    signature,
    bpm,
    setSignature,
    setSelectedChord,
    enabledShortcuts,
    selectedChord,
    timelinePosition,
    zoom,
    setIsMidiImportOverlayOpen,
    setMidiFile,
    incrementTimesExported,
  ] = useStore(
    (state) => [
      state.chords,
      state.setChords,
      state.signature,
      state.bpm,
      state.setSignature,
      state.setSelectedChord,
      state.enabledShortcuts,
      state.selectedChord,
      state.timelinePosition,
      state.zoom,
      state.setIsMidiImportOverlayOpen,
      state.setMidiFile,
      state.incrementTimesExported,
    ],
    shallow,
  );

  /* Transposition */
  const transposeChords = useCallback(
    (delta: number) => {
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
    },
    [chords, setChords],
  );

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
                typeof chord.variant !== "number",
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
      extractMidiFile(fileObj)
        .then((midi) => {
          setMidiFile(midi);
          setIsMidiImportOverlayOpen(true);
        })
        .catch((error) => {
          setChords(prevChords);
          alert(
            "An error occurred while importing the MIDI file. Please make sure it is valid.",
          );
        });
    }

    // Clear the input
    event.target.value = "";
  };

  /* Export */
  const [format, setFormat] = useState(".chseq");

  const formatRef = useRef(format);

  useEffect(() => {
    formatRef.current = format;
  }, [format]);

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
  const handleExport = useCallback(
    (format: string) => {
      incrementTimesExported();
      if (format === ".chseq") {
        const jsonData = JSON.stringify({
          chords: chords,
          signature: signature,
        });
        const blob = new Blob([jsonData], { type: "application/json" });

        downloadFile(blob, "chords.chseq");
      }
      if (format === ".mid") {
        const blob = getMidiBlob(chords, bpm, signature);

        downloadFile(blob, "chords.mid");
      }
    },
    [bpm, chords, incrementTimesExported, signature],
  );

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

  /* Shortcuts */
  const enabledShortcutsRef = useRef(enabledShortcuts);

  useEffect(() => {
    enabledShortcutsRef.current = enabledShortcuts;
  }, [enabledShortcuts]);

  // Keyboard shortcuts
  const handleEnterKey = useCallback(() => {
    // Confirm the transposition
    if (showTransposeDropdownRef.current) {
      const input = transposeDropdownRef.current?.querySelector("input");
      if (!input) return;
      transposeChords(parseInt(input.value, 10));
      setShowTransposeDropdown(false);
    }
    // Confirm the export
    if (showExportDropdownRef.current) {
      handleExport(formatRef.current);
      setShowExportDropdown(false);
    }
  }, [transposeChords, handleExport]);

  const keyEventHandlers: Record<string, () => void> = useMemo(() => {
    return {
      KeyT: () => {
        setShowTransposeDropdown(!showTransposeDropdownRef.current);
        setShowExportDropdown(false);
      },
      KeyI: () => importRef.current?.click(),
      KeyE: () => {
        setShowExportDropdown(!showExportDropdownRef.current);
        setShowTransposeDropdown(false);
      },
      ArrowUp: () => {
        // Increment the value in the transpose dropdown
        if (showTransposeDropdownRef.current) {
          const input = transposeDropdownRef.current?.querySelector("input");
          if (!input) return;
          input.value = Math.min(parseInt(input.value, 10) + 1, 11).toString();
        }
        // Change the export format
        if (showExportDropdownRef.current) {
          setFormat(formatRef.current === ".chseq" ? ".mid" : ".chseq");
        }
      },
      ArrowDown: () => {
        // Decrement the value in the transpose dropdown
        if (showTransposeDropdownRef.current) {
          const input = transposeDropdownRef.current?.querySelector("input");
          if (!input) return;
          input.value = Math.max(parseInt(input.value, 10) - 1, -11).toString();
        }
        // Change the export format
        if (showExportDropdownRef.current) {
          setFormat(formatRef.current === ".chseq" ? ".mid" : ".chseq");
        }
      },
      Enter: () => handleEnterKey(),
      NumpadEnter: () => handleEnterKey(),
      Escape: () => {
        if (showTransposeDropdownRef.current) setShowTransposeDropdown(false);
        if (showExportDropdownRef.current) setShowExportDropdown(false);
      },
    };
  }, [handleEnterKey]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Based on the key, call the corresponding handler function
      const key = event.code;
      const action =
        key + (event.altKey ? "_Alt" : "") + (event.ctrlKey ? "_Ctrl" : "");

      if (!enabledShortcutsRef.current) return;

      if (keyEventHandlers[action]) {
        event.preventDefault();
        keyEventHandlers[action]();
      }
    },
    [keyEventHandlers],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [chords, handleKeyDown, selectedChord, signature, timelinePosition, zoom]);

  return (
    <section className="relative flex h-[9dvh] max-h-min flex-row items-stretch justify-evenly rounded-[0.5dvw] bg-zinc-900 p-[2dvh] text-[2.5dvh]">
      <button
        className="flex h-full w-full select-none flex-col items-center justify-center filter active:brightness-90"
        title="Transpose (T)"
        onClick={() => setShowTransposeDropdown(!showTransposeDropdown)}
        ref={openTransposeDropdownButtonRef}
      >
        <Image
          src="/transpose.svg"
          alt="Transpose"
          width={100}
          height={100}
          className="h-full w-full"
        />
      </button>
      <button
        className="flex h-full w-full select-none flex-col items-center justify-center filter active:brightness-90"
        title="Import .chseq/.mid (I)"
        onClick={() => importRef.current?.click()}
      >
        <Image
          src="/import.svg"
          alt="Import"
          width={100}
          height={100}
          className="h-full w-full"
        />
        <input
          type="file"
          className="hidden"
          accept=".chseq,.mid"
          ref={importRef}
          onChange={handleFileChange}
        />
      </button>
      <button
        className="flex h-full w-full select-none flex-col items-center justify-center filter active:brightness-90"
        title="Export (E)"
        onClick={() => setShowExportDropdown(!showExportDropdown)}
        ref={openExportDropdownButtonRef}
      >
        <Image
          src="/export.svg"
          alt="Export"
          width={100}
          height={100}
          className="h-full w-full"
        />
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
          format={format}
          setFormat={setFormat}
        />
      )}
    </section>
  );
}
