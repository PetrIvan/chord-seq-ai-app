// Shared piano instrument settings so live playback (player.tsx) and offline
// audio export (audio_render.tsx) always sound identical. Tweaking the samples
// or the reverb here updates both paths at once, avoiding silent divergence
// between what the user hears and what they download.
export const samplerConfig = {
  urls: {
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
  },
  release: 1, // seconds
  baseUrl: "https://tonejs.github.io/audio/salamander/",
};

export const reverbDecay = 3; // seconds
