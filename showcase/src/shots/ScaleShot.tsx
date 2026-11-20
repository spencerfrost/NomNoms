import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BeatFrames, evenBeats } from "../beats";
import { BottomNav, Tap } from "../components/AppUi";
import { Backdrop } from "../components/Backdrop";
import { Phone, PHONE_HOME, StatusBar } from "../components/Phone";
import { MULTIPLIERS, presetX, PRESET_Y, RecipePage } from "../components/RecipePage";
import { StepCaption } from "../components/StepCaption";
import { beatPulse, clamp, press, snap } from "../motion";

/**
 * STEP 2, SCALE: the curry's page, the camera punches in on the ingredients,
 * and the presets are tapped on the beat: 2×, 3×, back to 2×. Every amount
 * rolls over, ranges and fractions included, and so does the yield.
 */
export const SCALE_SHOT_BEATS = 8;

/** How far the page is scrolled: the facts, Start cooking and the ingredients in view. */
export const SCALE_SCROLL = 330;
/** The camera: zoomed on the screen region from the facts down. */
const ZOOM = 1.55;
const ROI_Y = 540;
const PHONE_SCREEN_CENTRE = 422 + 14;

/** The taps: [beat, multiplier]. */
const TAPS: [number, number][] = [
  [2, 2],
  [4, 3],
  [6, 2],
];

export const ScaleShot: React.FC<{ beats?: BeatFrames }> = ({ beats = evenBeats() }) => {
  const frame = useCurrentFrame();
  const B = beats;
  const pulse = beatPulse(frame, B.slice(0, SCALE_SHOT_BEATS));
  const zoom = interpolate(frame, [0, 7], [0, 1], { ...clamp, easing: snap });
  const scale = PHONE_HOME.scale + (ZOOM - PHONE_HOME.scale) * zoom;
  const cy = 540 - (ROI_Y - PHONE_SCREEN_CENTRE) * (scale - PHONE_HOME.scale) * 1.6;
  const changes = TAPS.map(([b, m]) => [B[b], m] as [number, number]);
  const presetScale = (k: number) => TAPS.reduce((s, [b, m]) => (MULTIPLIERS[k] === m ? s * press(frame, B[b]) : s), 1);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop pulse={pulse * 0.5} drift={frame + 1500} />
      <StepCaption step={2} header="Scale it" detail="Every amount updates, fractions and ranges too." at={B[0] + 2} />
      <Phone scale={scale} cy={cy} cx={PHONE_HOME.cx + zoom * 60}>
        <RecipePage frame={frame} scroll={SCALE_SCROLL} changes={changes} presetScale={presetScale} />
        <StatusBar />
        <BottomNav active="recipes" />
        {TAPS.map(([b, m]) => (
          <Tap key={b} frame={frame} at={B[b]} x={presetX(MULTIPLIERS.indexOf(m))} y={PRESET_Y - SCALE_SCROLL} />
        ))}
      </Phone>
    </AbsoluteFill>
  );
};
