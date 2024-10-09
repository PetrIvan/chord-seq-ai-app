"use client";
import { createWithEqualityFn } from "zustand/traditional";
import { persist } from "zustand/middleware";

import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";

import { genres, decades } from "@/data/conditions";
import { tokenToChord } from "@/data/token_to_chord";
import { Midi } from "@tonejs/midi";
import {
  setMuteMetronome as setMuteMetronomePlayer,
  setLoop as setLoopPlayer,
  setBpm as setBpmPlayer,
} from "@/playback/player";

const deepCompareUpdate = (partial: any, state: any) => {
  if (partial.chords && isEqual(partial.chords, state.chords)) {
    // Skip update if chords are the same
    return state;
  }
  return { ...state, ...partial };
};

interface Data {
  chords: { index: number; token: number; duration: number; variant: number }[];
  signature: [number, number];
  selected: number;
}

interface StoreState {
  // Chords
  chords: { index: number; token: number; duration: number; variant: number }[];
  setChords: (
    state: {
      index: number;
      token: number;
      duration: number;
      variant: number;
    }[],
    ignoreStateWindow?: boolean,
  ) => void;
  selectedChord: number; // Index of the selected chord
  setSelectedChord: (state: number, ignoreStateWindow?: boolean) => void;
  addChord: () => {
    index: number;
    token: number;
    duration: number;
    variant: number;
  }[];
  deleteChord: () => void;
  replaceChord: (token: number, variant: number) => void;
  clearChords: () => void;

  // Timeline
  resizingChord: boolean; // Whether the user is resizing any chord
  setResizingChord: (state: boolean) => void;
  signature: [number, number]; // [numerator, denominator]
  setSignature: (state: [number, number], ignoreStateWindow?: boolean) => void;
  zoom: number; // Default is 1, less means zoomed out
  setZoom: (state: number) => void;
  timelinePosition: number; // Where the timeline is scrolled to (on screen), in dvw
  setTimelinePosition: (state: number) => void;
  playheadPosition: number; // Where the playhead is (on screen), in dvw
  setPlayheadPosition: (state: number) => void;
  isPinchZooming: boolean; // Whether the user is pinch zooming (on mobile/touchpad)
  setIsPinchZooming: (state: boolean) => void;
  isReordering: boolean; // Whether the user is reordering chords
  setIsReordering: (state: boolean) => void;

  // State window (undo/redo)
  stateWindow: [Data][];
  setStateWindow: (stateWindow: [Data][]) => void;
  maxStateWindowLength: number; // Max number of states to keep in the state window
  stateWindowIndex: number; // Index of the current state
  setStateWindowIndex: (stateWindowIndex: number) => void;
  saveStateWindow: () => void;
  loadStateWindow: (index: number) => void;
  initializeStateWindow: () => void;
  undo: () => void;
  redo: () => void;

  // Model settings
  modelPath: string;
  setModelPath: (modelPath: string) => void;
  selectedGenres: number[]; // Weighted values
  setSelectedGenres: (genres: number[]) => void;
  selectedDecades: number[]; // Weighted values
  setSelectedDecades: (decades: number[]) => void;

  // Model loading
  isDownloadingModel: boolean;
  setIsDownloadingModel: (downloadingModel: boolean) => void;
  isLoadingSession: boolean;
  setIsLoadingSession: (isLoadingSession: boolean) => void;
  percentageDownloaded: number;
  setPercentageDownloaded: (percentageDownloaded: number) => void;
  modelSize: number; // Size of the model in MB
  setModelSize: (modelSize: number) => void;

  // Playback
  muteMetronome: boolean;
  setMuteMetronome: (muteMetronome: boolean) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  loop: boolean;
  setLoop: (loop: boolean) => void;
  initializePlayback: () => void;

  // Suggestions
  enabledShortcuts: boolean; // When typing in the search bar, disable shortcuts
  setEnabledShortcuts: (enabledShortcuts: boolean) => void;
  decayFactor: number; // How much to decay the color of the suggestions, not limited to a specific range (the slider uses 3-9)
  setDecayFactor: (decay: number) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  searchNotes: number[];
  setSearchNotes: (searchNotes: number[]) => void;
  matchType: number;
  setMatchType: (matchType: number) => void;
  matchAnyVariant: boolean;
  setMatchAnyVariant: (matchAnyOctave: boolean) => void;
  includeVariants: boolean;
  setIncludeVariants: (includeVariants: boolean) => void;

  // Variants
  variantsOpen: boolean;
  setVariantsOpen: (variantsOpen: boolean) => void;
  isVariantsOpenFromSuggestions: boolean;
  setIsVariantsOpenFromSuggestions: (
    isVariantsOpenFromSuggestions: boolean,
  ) => void;
  selectedVariant: number;
  setSelectedVariant: (variant: number) => void;
  selectedToken: number;
  setSelectedToken: (token: number) => void;
  selectedChordVariants: number;
  setSelectedChordVariants: (chord: number) => void;
  defaultVariants: number[];
  setDefaultVariants: (defaultVariants: number[]) => void;
  replaceDefaultVariant: (token: number, defaultVariant: number) => void;

  // Welcome overlay
  welcomeFirstTime: boolean;
  setWelcomeFirstTime: (welcomeFirstTime: boolean) => void;
  isWelcomeOverlayOpen: boolean;
  setIsWelcomeOverlayOpen: (isWelcomeOverlayOpen: boolean) => void;
  watchedVideoTutorial: boolean;
  setWatchedVideoTutorial: (watchedVideoTutorial: boolean) => void;

  // New features overlay
  version: number;
  setVersion: (version: number) => void;
  isNewFeaturesOverlayOpen: boolean;
  setIsNewFeaturesOverlayOpen: (isNewFeaturesOverlayOpen: boolean) => void;

  // Step-by-step tutorial
  isStepByStepTutorialOpen: boolean;
  setIsStepByStepTutorialOpen: (isStepByStepTutorialOpen: boolean) => void;
  tutorialStep: number;
  setTutorialStep: (tutorialStep: number) => void;

  // Support us overlay
  isSupportUsOverlayOpen: boolean;
  setIsSupportUsOverlayOpen: (isSupportUsOverlayOpen: boolean) => void;
  isSupportUsAfterExport: boolean;
  setIsSupportUsAfterExport: (isSupportUsAfterExport: boolean) => void;
  timesExported: number;
  incrementTimesExported: () => void;
  dontShowSupportUsOverlay: boolean;
  setDontShowSupportUsOverlay: (dontShowSupportUsOverlay: boolean) => void;

  // MIDI import overlay
  isMidiImportOverlayOpen: boolean;
  setIsMidiImportOverlayOpen: (isMidiImportOverlayOpen: boolean) => void;
  midiFile: Midi;
  setMidiFile: (midiFile: Midi) => void;

  // UI
  customScrollbarEnabled: boolean;
  setCustomScrollbarEnabled: (customScrollbarEnabled: boolean) => void;
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
  showFullscreenButton: boolean;
  setShowFullscreenButton: (showFullscreenButton: boolean) => void;

  // Wiki
  wikiSidenavOpen: Map<string, boolean>;
  setWikiSidenavOpen: (wikiSidenavOpen: Map<string, boolean>) => void;
  wikiSidenavScroll: number;
  setWikiSidenavScroll: (wikiSidenavScroll: number) => void;
}

export const useStore = createWithEqualityFn<StoreState>()(
  persist(
    (set, get) => ({
      // Chords
      chords: [],
      setChords: (
        chords: {
          index: number;
          token: number;
          duration: number;
          variant: number;
        }[],
        ignoreStateWindow?: boolean,
      ) => {
        set((state) => deepCompareUpdate({ chords }, state));
        if (!ignoreStateWindow) get().saveStateWindow();
      },
      selectedChord: -1,
      setSelectedChord: (
        selectedChord: number,
        ignoreStateWindow?: boolean,
      ) => {
        set({ selectedChord });
        if (!ignoreStateWindow) get().saveStateWindow();
      },
      addChord: () => {
        let chords = cloneDeep(get().chords);

        if (get().selectedChord === -1) {
          // Append to the end
          chords.push({
            index: chords.length,
            token: -1,
            duration: (get().signature[0] / get().signature[1]) * 4,
            variant: 0,
          });
        } else {
          // Insert at the selected index
          chords.splice(get().selectedChord + 1, 0, {
            index: get().selectedChord + 1,
            token: -1,
            duration: (get().signature[0] / get().signature[1]) * 4,
            variant: 0,
          });

          // Reindex
          for (let i = 0; i < chords.length; i++) {
            chords[i].index = i;
          }
        }

        get().setChords(chords);

        return chords;
      },
      deleteChord: () => {
        // Delete the selected chord
        let chords = cloneDeep(get().chords);

        chords = chords.filter((chord) => chord.index !== get().selectedChord);

        // Reindex
        for (let i = 0; i < chords.length; i++) {
          chords[i].index = i;
        }

        if (get().selectedChord > chords.length - 1) {
          get().setSelectedChord(Math.max(get().selectedChord - 1, -1));
        }
        get().setChords(chords);
      },
      replaceChord: (token: number, variant: number) => {
        // Used in suggestions
        if (get().selectedChord === -1) return;
        let chords = cloneDeep(get().chords);
        chords[get().selectedChord].token = token;
        chords[get().selectedChord].variant = variant;
        get().setChords(chords);
      },
      clearChords: () => {
        if (get().chords.length === 0) return;
        get().setSelectedChord(-1, true);
        get().setChords([]);
      },

      // Timeline
      resizingChord: false,
      setResizingChord: (resizingChord: boolean) => set({ resizingChord }),
      signature: [4, 4],
      setSignature: (
        signature: [number, number],
        ignoreStateWindow?: boolean,
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
      isPinchZooming: false,
      setIsPinchZooming: (isPinchZooming: boolean) => set({ isPinchZooming }),
      isReordering: false,
      setIsReordering: (isReordering: boolean) => set({ isReordering }),

      // State window
      stateWindow: [],
      setStateWindow: (stateWindow: [Data][]) => set({ stateWindow }),
      maxStateWindowLength: 64,
      stateWindowIndex: -1,
      setStateWindowIndex: (stateWindowIndex: number) =>
        set({ stateWindowIndex }),
      saveStateWindow: () => {
        const currStateWindow = [...get().stateWindow];

        // Prevent saving if the user is resizing a chord
        if (get().resizingChord) return;

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
      initializeStateWindow: () => {
        // Save the initial state so that we can undo to it
        if (get().stateWindow.length === 0) get().saveStateWindow();
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
      modelPath: "/models/conditional_medium.onnx", // Default model
      setModelPath: (modelPath: string) => set({ modelPath }),
      selectedGenres: Array(genres.length).fill(0),
      setSelectedGenres: (selectedGenres: number[]) => set({ selectedGenres }),
      selectedDecades: Array(decades.length).fill(0),
      setSelectedDecades: (selectedDecades: number[]) =>
        set({ selectedDecades }),

      // Model loading
      isDownloadingModel: false,
      setIsDownloadingModel: (isDownloadingModel: boolean) =>
        set({ isDownloadingModel }),
      isLoadingSession: false,
      setIsLoadingSession: (isLoadingSession: boolean) =>
        set({ isLoadingSession }),
      percentageDownloaded: 0,
      setPercentageDownloaded: (percentageDownloaded: number) =>
        set({ percentageDownloaded }),
      modelSize: 0,
      setModelSize: (modelSize: number) => set({ modelSize }),

      // Playback
      muteMetronome: false,
      setMuteMetronome: (muteMetronome: boolean) => {
        set({ muteMetronome });
        setMuteMetronomePlayer(muteMetronome);
      },
      bpm: 120,
      setBpm: (bpm: number) => {
        set({ bpm });
        setBpmPlayer(bpm);
      },
      loop: false,
      setLoop: (loop: boolean) => {
        set({ loop });
        setLoopPlayer(loop);
      },
      initializePlayback: () => {
        setMuteMetronomePlayer(get().muteMetronome);
        setBpmPlayer(get().bpm);
        setLoopPlayer(get().loop);
      },

      // Suggestions
      enabledShortcuts: true,
      setEnabledShortcuts: (enabledShortcuts: boolean) =>
        set({ enabledShortcuts }),
      decayFactor: 6, // Middle of the slider (3-9)
      setDecayFactor: (decayFactor: number) => set({ decayFactor }),
      searchQuery: "",
      setSearchQuery: (searchQuery: string) => set({ searchQuery }),
      searchNotes: [],
      setSearchNotes: (searchNotes: number[]) => set({ searchNotes }),
      matchType: 0,
      setMatchType: (matchType: number) => set({ matchType }),
      matchAnyVariant: true,
      setMatchAnyVariant: (matchAnyOctave: boolean) =>
        set({ matchAnyVariant: matchAnyOctave }),
      includeVariants: false,
      setIncludeVariants: (includeVariants: boolean) =>
        set({ includeVariants }),

      // Variants
      variantsOpen: false,
      setVariantsOpen: (variantsOpen: boolean) => set({ variantsOpen }),
      isVariantsOpenFromSuggestions: false,
      setIsVariantsOpenFromSuggestions: (
        isVariantsOpenFromSuggestions: boolean,
      ) => set({ isVariantsOpenFromSuggestions }),
      selectedVariant: 0,
      setSelectedVariant: (selectedVariant: number) => set({ selectedVariant }),
      selectedToken: -1,
      setSelectedToken: (selectedToken: number) => set({ selectedToken }),
      selectedChordVariants: -1,
      setSelectedChordVariants: (selectedChordVariants: number) =>
        set({ selectedChordVariants }),
      defaultVariants: Array.from(
        { length: Object.keys(tokenToChord).length },
        (value, key) => 0,
      ),
      setDefaultVariants: (defaultVariants: number[]) =>
        set({ defaultVariants }),
      replaceDefaultVariant: (token: number, defaultVariant: number) => {
        let defaultVariants = cloneDeep(get().defaultVariants);
        defaultVariants[token] = defaultVariant;
        get().setDefaultVariants(defaultVariants);
      },

      // Welcome overlay
      welcomeFirstTime: true,
      setWelcomeFirstTime: (welcomeFirstTime: boolean) =>
        set({ welcomeFirstTime }),
      isWelcomeOverlayOpen: false,
      setIsWelcomeOverlayOpen: (isWelcomeOverlayOpen: boolean) =>
        set({ isWelcomeOverlayOpen }),
      watchedVideoTutorial: false,
      setWatchedVideoTutorial: (watchedVideoTutorial: boolean) =>
        set({ watchedVideoTutorial }),

      // New features overlay
      version: 0,
      setVersion: (version: number) => set({ version }),
      isNewFeaturesOverlayOpen: false,
      setIsNewFeaturesOverlayOpen: (isNewFeaturesOverlayOpen: boolean) =>
        set({ isNewFeaturesOverlayOpen }),

      // Step-by-step tutorial
      isStepByStepTutorialOpen: false,
      setIsStepByStepTutorialOpen: (isStepByStepTutorialOpen: boolean) =>
        set({ isStepByStepTutorialOpen }),
      tutorialStep: 0,
      setTutorialStep: (tutorialStep: number) => set({ tutorialStep }),

      // Support us overlay
      isSupportUsOverlayOpen: false,
      setIsSupportUsOverlayOpen: (isSupportUsOverlayOpen: boolean) =>
        set({ isSupportUsOverlayOpen }),
      isSupportUsAfterExport: false,
      setIsSupportUsAfterExport: (isSupportUsAfterExport: boolean) =>
        set({ isSupportUsAfterExport }),
      timesExported: 0,
      incrementTimesExported: () =>
        set({ timesExported: get().timesExported + 1 }),
      dontShowSupportUsOverlay: false,
      setDontShowSupportUsOverlay: (dontShowSupportUsOverlay: boolean) =>
        set({ dontShowSupportUsOverlay }),

      // MIDI import overlay
      isMidiImportOverlayOpen: false,
      setIsMidiImportOverlayOpen: (isMidiImportOverlayOpen: boolean) =>
        set({ isMidiImportOverlayOpen }),
      midiFile: new Midi(),
      setMidiFile: (midiFile: Midi) => set({ midiFile }),

      // UI
      customScrollbarEnabled: true,
      setCustomScrollbarEnabled: (customScrollbarEnabled: boolean) =>
        set({ customScrollbarEnabled }),
      isMobile: false,
      setIsMobile: (isMobile: boolean) => set({ isMobile }),
      showFullscreenButton: false,
      setShowFullscreenButton: (showFullscreenButton: boolean) =>
        set({ showFullscreenButton }),

      // Wiki
      wikiSidenavOpen: new Map(),
      setWikiSidenavOpen: (wikiSidenavOpen: Map<string, boolean>) =>
        set({ wikiSidenavOpen }),
      wikiSidenavScroll: 0,
      setWikiSidenavScroll: (wikiSidenavScroll: number) =>
        set({ wikiSidenavScroll }),
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
        muteMetronome: state.muteMetronome,
        bpm: state.bpm,
        loop: state.loop,
        defaultVariants: state.defaultVariants,
        welcomeFirstTime: state.welcomeFirstTime,
        timesExported: state.timesExported,
        dontShowSupportUsOverlay: state.dontShowSupportUsOverlay,
        version: state.version,
      }),
    },
  ),
);
