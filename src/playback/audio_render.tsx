import * as Tone from "tone";

import { chordsToNoteEvents } from "./player";
import { audioBufferToWav, audioBufferToMp3 } from "./audio_encoders";
import { samplerConfig, reverbDecay } from "./instrument_config";
import { Chord } from "@/state/chord";

// The offline render rebuilds the same sampler+reverb graph as live playback
// (shared via instrument_config) so exported audio matches what the user hears,
// and pads the render by the reverb + sampler-release tail so it is not clipped.
const RENDER_TAIL = reverbDecay + samplerConfig.release; // seconds
const SAMPLE_RATE = 44100;
const CHANNELS = 2;

// Render a chord sequence to an AudioBuffer entirely offline (no real-time
// playback). The sampler and reverb must be constructed inside the offline
// context - the live instances in player.tsx belong to a different context and
// cannot be reused here.
async function renderSequence(
  chords: Chord[],
  bpm: number,
): Promise<AudioBuffer> {
  const { events, totalTime } = chordsToNoteEvents(chords, bpm);

  if (totalTime <= 0 || events.length === 0) {
    throw new Error("Nothing to render - the sequence is empty.");
  }

  const buffer = await Tone.Offline(
    async (context) => {
      const synth = new Tone.Sampler(samplerConfig).toDestination();

      const reverb = new Tone.Reverb(reverbDecay).toDestination();
      synth.connect(reverb);

      // Offline rendering does not wait for async setup on its own: the
      // Salamander samples download over the network and the reverb generates
      // its impulse response asynchronously, so both must be awaited before the
      // transport runs or the render comes out silent.
      await Tone.loaded();
      await reverb.generate();

      const part = new Tone.Part((time, value) => {
        synth.triggerAttackRelease(value.note, value.duration, time);
      }, events);
      part.start(0);

      context.transport.start();
    },
    totalTime + RENDER_TAIL,
    CHANNELS,
    SAMPLE_RATE,
  );

  const audioBuffer = buffer.get();
  if (!audioBuffer) {
    throw new Error("Offline render produced no audio.");
  }
  return audioBuffer;
}

// Render the sequence and return a WAV blob ready for download.
export async function getWavBlob(chords: Chord[], bpm: number): Promise<Blob> {
  const buffer = await renderSequence(chords, bpm);
  return audioBufferToWav(buffer);
}

// Render the sequence and return an MP3 blob ready for download.
export async function getMp3Blob(chords: Chord[], bpm: number): Promise<Blob> {
  const buffer = await renderSequence(chords, bpm);
  return audioBufferToMp3(buffer);
}
