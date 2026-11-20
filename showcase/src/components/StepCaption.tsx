import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { clamp, snap } from "../motion";
import { color, font } from "../theme";

/**
 * Each step's card colour, from the app's palette: the four tile colours, then
 * grape for the last. Cook mode gets pink, not mint, so its caption doesn't
 * match the mint step card on the phone beside it.
 */
const STEP_TONES: Record<number, { bg: string; ink: string; muted: string }> = {
  1: { bg: color.mango, ink: color.foreground, muted: color.mutedFg },
  2: { bg: color.mint, ink: color.foreground, muted: color.mutedFg },
  3: { bg: color.pink, ink: color.foreground, muted: color.mutedFg },
  4: { bg: color.sky, ink: color.foreground, muted: color.mutedFg },
  5: { bg: color.primary, ink: color.primaryFg, muted: "#d9cef0" },
};

/**
 * The caption for each step: a card in that step's colour with a plain header
 * and one line of detail saying what's on screen. It enters calmly (no slam):
 * the card slides in and the text follows from the right, as a new step does
 * in the app's cook mode (CookMode.tsx).
 */
export const StepCaption: React.FC<{
  /** Which step (1–5); picks the card's colour. */
  step: number;
  header: string;
  detail: string;
  /** Frame the caption enters on, and the frame it leaves by (if any). */
  at?: number;
  out?: number;
  x?: number;
  y?: number;
  width?: number;
}> = ({ step, header, detail, at = 0, out, x = 120, y = 540, width = 700 }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [at, at + 8], [0, 1], { ...clamp, easing: snap });
  const leave = out === undefined ? 0 : interpolate(frame, [out - 6, out], [0, 1], { ...clamp, easing: snap });
  const text = interpolate(frame, [at + 3, at + 10], [0, 1], { ...clamp, easing: snap });
  if (frame < at || leave >= 1) return null;
  const tone = STEP_TONES[step] ?? STEP_TONES[3];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        transform: `translateY(-50%) translateX(${(1 - enter) * -40 - leave * 40}px)`,
        opacity: enter * (1 - leave),
        borderRadius: 44,
        background: tone.bg,
        padding: "38px 44px 42px",
        color: tone.ink,
        boxShadow: "0 30px 60px rgba(43,20,71,0.12)",
      }}
    >
      <div style={{ opacity: text, transform: `translateX(${(1 - text) * 50}px)` }}>
        <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 58, lineHeight: 1.1 }}>{header}</div>
        <div style={{ fontFamily: font.body, fontWeight: 500, fontSize: 32, lineHeight: 1.35, marginTop: 12, color: tone.muted }}>
          {detail}
        </div>
      </div>
    </div>
  );
};
