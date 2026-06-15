import { describe, it, expect, beforeEach, vi } from "vitest";

// The store calls into the Tone-backed player for playback settings. Stub that
// module so importing the store doesn't spin up Web Audio.
vi.mock("@/playback/player", () => ({
  setMuteMetronome: vi.fn(),
  setLoop: vi.fn(),
  setBpm: vi.fn(),
}));

import { useStore } from "./use_store";
import { makeChords } from "@/test/chords";

// Reset only the editing-related slice the tests touch, leaving the action
// implementations in place.
function resetStore() {
  useStore.setState({
    chords: [],
    selectedChord: -1,
    signature: [4, 4],
    resizingChord: false,
    stateWindow: [],
    stateWindowIndex: -1,
  });
}

beforeEach(() => {
  resetStore();
});

describe("addChord", () => {
  it("appends a rest at the end when nothing is selected", () => {
    useStore.getState().addChord();

    const { chords } = useStore.getState();
    expect(chords).toHaveLength(1);
    expect(chords[0]).toMatchObject({ index: 0, token: -1, variant: 0 });
    // duration defaults to a full bar: (numerator / denominator) * 4.
    expect(chords[0].duration).toBe(4);
  });

  it("inserts after the selected chord and reindexes", () => {
    useStore.setState({ chords: makeChords([10, 20]), selectedChord: 0 });

    useStore.getState().addChord();

    const { chords } = useStore.getState();
    expect(chords.map((c) => c.token)).toEqual([10, -1, 20]);
    expect(chords.map((c) => c.index)).toEqual([0, 1, 2]);
  });
});

describe("deleteChord", () => {
  it("removes the selected chord, reindexes, and clamps the selection", () => {
    useStore.setState({ chords: makeChords([10, 20, 30]), selectedChord: 2 });

    useStore.getState().deleteChord();

    const { chords, selectedChord } = useStore.getState();
    expect(chords.map((c) => c.token)).toEqual([10, 20]);
    expect(chords.map((c) => c.index)).toEqual([0, 1]);
    // Selection pointed at the now-removed last chord, so it steps back.
    expect(selectedChord).toBe(1);
  });

  it("leaves the selection alone when it still points at a valid chord", () => {
    useStore.setState({ chords: makeChords([10, 20, 30]), selectedChord: 0 });

    useStore.getState().deleteChord();

    const { chords, selectedChord } = useStore.getState();
    expect(chords.map((c) => c.token)).toEqual([20, 30]);
    expect(selectedChord).toBe(0);
  });
});

describe("replaceChord", () => {
  it("does nothing when no chord is selected", () => {
    useStore.setState({ chords: makeChords([10]), selectedChord: -1 });

    useStore.getState().replaceChord(7, 2);

    expect(useStore.getState().chords[0]).toMatchObject({
      token: 10,
      variant: 0,
    });
  });

  it("overwrites the selected chord's token and variant", () => {
    useStore.setState({ chords: makeChords([10, 20]), selectedChord: 1 });

    useStore.getState().replaceChord(7, 2);

    const { chords } = useStore.getState();
    expect(chords[1]).toMatchObject({ token: 7, variant: 2 });
    expect(chords[0]).toMatchObject({ token: 10, variant: 0 }); // untouched
  });
});

describe("clearChords", () => {
  it("empties the sequence and resets the selection", () => {
    useStore.setState({ chords: makeChords([10, 20]), selectedChord: 1 });

    useStore.getState().clearChords();

    expect(useStore.getState().chords).toEqual([]);
    expect(useStore.getState().selectedChord).toBe(-1);
  });

  it("is a no-op on an already empty sequence", () => {
    const before = useStore.getState().chords;
    useStore.getState().clearChords();
    expect(useStore.getState().chords).toBe(before);
  });
});

describe("setChords", () => {
  it("skips the update when the new chords deep-equal the current ones", () => {
    const chords = makeChords([10, 20]);
    useStore.getState().setChords(chords);
    const stored = useStore.getState().chords;

    // A structurally identical but distinct array should not replace the ref.
    useStore.getState().setChords(makeChords([10, 20]));
    expect(useStore.getState().chords).toBe(stored);
  });
});

describe("undo / redo", () => {
  it("walks back and forward through the edit history", () => {
    const store = useStore.getState();

    // Seed the history with the initial (empty) state, then make an edit.
    store.initializeStateWindow();
    store.addChord();
    expect(useStore.getState().chords).toHaveLength(1);

    useStore.getState().undo();
    expect(useStore.getState().chords).toHaveLength(0);

    useStore.getState().redo();
    expect(useStore.getState().chords).toHaveLength(1);
  });

  it("does not move before the first or past the last recorded state", () => {
    const store = useStore.getState();
    store.initializeStateWindow();
    store.addChord();

    // Redo at the newest state is a no-op.
    useStore.getState().redo();
    expect(useStore.getState().chords).toHaveLength(1);

    // Undo to the start, then a further undo stays put.
    useStore.getState().undo();
    useStore.getState().undo();
    expect(useStore.getState().chords).toHaveLength(0);
    expect(useStore.getState().stateWindowIndex).toBe(0);
  });
});
