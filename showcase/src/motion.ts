import { Easing, interpolate, spring } from "remotion";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** The sharp ease for zooms, entrances and exits. */
export const snap = Easing.bezier(0.6, 0, 0.15, 1);

/** 0 → 1 over [start, start + len] with the snap ease. */
export const snapIn = (frame: number, start: number, len = 8) =>
  interpolate(frame, [start, start + len], [0, 1], { ...clamp, easing: snap });

/** A quick, slightly bouncy pop for things landing on a beat. */
export const pop = (frame: number, start: number, fps: number, stiffness = 260) =>
  frame < start ? 0 : spring({ frame: frame - start, fps, config: { damping: 13, stiffness } });

/** A press: scale dips and recovers. */
export const press = (frame: number, at: number) => interpolate(frame - at, [0, 3, 8], [1, 0.92, 1], clamp);

/** Characters of `text` typed between two frames. */
export const typed = (text: string, frame: number, from: number, to: number) =>
  text.slice(0, Math.round(interpolate(frame, [from, to], [0, text.length], clamp)));

/** Pulse on each beat: 1 on the beat, decaying to 0 over `len` frames. */
export const beatPulse = (frame: number, beats: number[], len = 8) => {
  let last = -Infinity;
  for (const b of beats) if (b <= frame) last = b;
  return interpolate(frame - last, [0, len], [1, 0], clamp);
};
