"use client";
import { createWithEqualityFn } from "zustand/traditional";
import { persist } from "zustand/middleware";

import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";

import { genres, decades } from "@/data/conditions";

const deepCompareUpdate = (partial: any, state: any) => {
  if (partial.chords && isEqual(partial.chords, state.chords)) {
    // Skip update if chords are the same
    return state;
  }
  return { ...state, ...partial };
};

interface Data {
  chords: [number, number, number][];
  signature: [number, number];
  selected: number;
}

interface StoreState {
  // Chords
  chords: [number, number, number][]; // [index, chord, duration]
  setChords: (
    state: [number, number, number][],
    ignoreStateWindow?: boolean
  ) => void;
  selectedChord: number; // Index of the selected chord
  setSelectedChord: (state: number, ignoreStateWindow?: boolean) => void;
  addChord: () => [number, number, number][];
  deleteChord: () => void;
  replaceChord: (chord: number) => void;

  // Timeline
  resizingChord: boolean; // Whether the user is resizing any chord
  setResizingChord: (state: boolean) => void;
  signature: [number, number]; // [numerator, denominator]
  setSignature: (state: [number, number], ignoreStateWindow?: boolean) => void;
  zoom: number; // Default is 1, less means zoomed out
  setZoom: (state: number) => void;
  timelinePosition: number; // Where the timeline is scrolled to (on screen)
  setTimelinePosition: (state: number) => void;
  playheadPosition: number; // Where the playhead is (on screen)
  setPlayheadPosition: (state: number) => void;

  // State window (undo/redo)
  stateWindow: [Data][];
  setStateWindow: (stateWindow: [Data][]) => void;
  maxStateWindowLength: number; // Max number of states to keep in the state window
  stateWindowIndex: number; // Index of the current state
  setStateWindowIndex: (stateWindowIndex: number) => void;
  saveStateWindow: () => void;
  loadStateWindow: (index: number) => void;
  undo: () => void;
  redo: () => void;

  // Model settings
  modelPath: string;
  setModelPath: (modelPath: string) => void;
  selectedGenres: number[]; // Weighted values
  setSelectedGenres: (genres: number[]) => void;
  selectedDecades: number[]; // Weighted values
  setSelectedDecades: (decades: number[]) => void;

  // Playback
  bpm: number;
  setBpm: (bpm: number) => void;

  // Suggestions
  enabledShortcuts: boolean; // When typing in the search bar, disable shortcuts
  setEnabledShortcuts: (enabledShortcuts: boolean) => void;
  decayFactor: number; // How much to decay the color of the suggestions, not limited to a specific range (the slider uses 3-9)
  setDecayFactor: (decay: number) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
}

export const useStore = createWithEqualityFn<StoreState>()(
  persist(
    (set, get) => ({
      // Chords
      chords: [],
      setChords: (
        chords: [number, number, number][],
        ignoreStateWindow?: boolean
      ) => {
        set((state) => deepCompareUpdate({ chords }, state));
        if (!ignoreStateWindow) get().saveStateWindow();
      },
      selectedChord: -1,
      setSelectedChord: (
        selectedChord: number,
        ignoreStateWindow?: boolean
      ) => {
        set({ selectedChord });
        if (!ignoreStateWindow) get().saveStateWindow();
      },
      addChord: () => {
        let chords = cloneDeep(get().chords);

        if (get().selectedChord === -1) {
          // Append to the end
          chords.push([
            chords.length,
            -1,
            (get().signature[0] / get().signature[1]) * 4,
          ]);
        } else {
          // Insert at the selected index
          chords.splice(get().selectedChord + 1, 0, [
            get().selectedChord + 1,
            -1,
            (get().signature[0] / get().signature[1]) * 4,
          ]);

          // Reindex
          for (let i = 0; i < chords.length; i++) {
            chords[i][0] = i;
          }
        }

        get().setChords(chords);

        return chords;
      },
      deleteChord: () => {
        // Delete the selected chord
        let chords = cloneDeep(get().chords);

        chords = chords.filter((chord) => chord[0] !== get().selectedChord);

        // Reindex
        for (let i = 0; i < chords.length; i++) {
          chords[i][0] = i;
        }

        if (get().selectedChord > chords.length - 1) {
          get().setSelectedChord(Math.max(get().selectedChord - 1, -1));
        }
        get().setChords(chords);
      },
      replaceChord: (chord: number) => {
        // Used in suggestions
        if (get().selectedChord === -1) return;
        let chords = cloneDeep(get().chords);
        chords[get().selectedChord][1] = chord;
        get().setChords(chords);
      },

      // Timeline
      resizingChord: false,
      setResizingChord: (resizingChord: boolean) => set({ resizingChord }),
      signature: [4, 4],
      setSignature: (
        signature: [number, number],
        ignoreStateWindow?: boolean
      ) => {
        set({ signature });
        if (!ignoreStateWindow) get().saveStateWindow();
      },
      zoom: 1,
      setZoom: (zoom: number) => set({ zoom }),
      timelinePosition: 0,
      setTimelinePosition: (timelinePosition: number) =>
        set({ timelinePosition }),
      playheadPosition: 0,
      setPlayheadPosition: (playheadPosition: number) =>
        set({ playheadPosition }),

      // State window
      stateWindow: [],
      setStateWindow: (stateWindow: [Data][]) => set({ stateWindow }),
      maxStateWindowLength: 64,
      stateWindowIndex: -1,
      setStateWindowIndex: (stateWindowIndex: number) =>
        set({ stateWindowIndex }),
      saveStateWindow: () => {
        const currStateWindow = [...get().stateWindow];

        // Prevent saving if there are no chords or if the user is resizing a chord
        if (get().chords.length === 0 || get().resizingChord) return;

        // Whether to overwrite the future states (when we change something after undoing)
        if (get().stateWindowIndex < get().stateWindow.length - 1) {
          currStateWindow.splice(get().stateWindowIndex + 1);
        }

        // Add the current state to the state window
        currStateWindow.push([
          {
            chords: cloneDeep(get().chords),
            signature: cloneDeep(get().signature),
            selected: get().selectedChord,
          },
        ]);

        // Limit the state window length
        if (currStateWindow.length > get().maxStateWindowLength) {
          currStateWindow.shift();
        } else {
          get().setStateWindowIndex(get().stateWindowIndex + 1);
        }

        get().setStateWindow(currStateWindow);
      },
      loadStateWindow: (index: number) => {
        get().setStateWindowIndex(index);
        const [data] = get().stateWindow[index];

        // Load without saving to the state window
        get().setChords(data.chords, true);
        get().setSignature(data.signature, true);
        get().setSelectedChord(data.selected, true);
      },
      undo: () => {
        if (get().stateWindowIndex > 0) {
          get().loadStateWindow(get().stateWindowIndex - 1);
        }
      },
      redo: () => {
        if (get().stateWindowIndex < get().stateWindow.length - 1) {
          get().loadStateWindow(get().stateWindowIndex + 1);
        }
      },

      // Model settings
      modelPath: "/models/transformer_small.onnx", // Default model
      setModelPath: (modelPath: string) => set({ modelPath }),
      selectedGenres: Array(genres.length).fill(0),
      setSelectedGenres: (selectedGenres: number[]) => set({ selectedGenres }),
      selectedDecades: Array(decades.length).fill(0),
      setSelectedDecades: (selectedDecades: number[]) =>
        set({ selectedDecades }),

      // Playback
      bpm: 120,
      setBpm: (bpm: number) => set({ bpm }),

      // Suggestions
      enabledShortcuts: true,
      setEnabledShortcuts: (enabledShortcuts: boolean) =>
        set({ enabledShortcuts }),
      decayFactor: 6,
      setDecayFactor: (decayFactor: number) => set({ decayFactor }),
      searchQuery: "",
      setSearchQuery: (searchQuery: string) => set({ searchQuery }),
    }),
    {
      // Saving
      name: "state",
      partialize: (state) => ({
        chords: state.chords,
        signature: state.signature,
        modelPath: state.modelPath,
        selectedGenres: state.selectedGenres,
        selectedDecades: state.selectedDecades,
        bpm: state.bpm,
      }),
    }
  )
);
