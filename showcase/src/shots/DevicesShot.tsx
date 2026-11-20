import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BeatFrames, evenBeats } from "../beats";
import { BottomNav } from "../components/AppUi";
import { Backdrop } from "../components/Backdrop";
import { BrowserChrome, Device, LAPTOP, mixShape, PHONE, TABLET } from "../components/Devices";
import { StatusBar } from "../components/Phone";
import { ResponsiveRecipe } from "../components/ResponsiveRecipe";
import { StepCaption } from "../components/StepCaption";
import { HERO } from "../data/recipes";
import { beatPulse, clamp, snap } from "../motion";

/**
 * STEP 4, ANY DEVICE: the curry's page on the phone (cook mode just closed),
 * then the phone morphs into a tablet and into a laptop. The page reflows at
 * every width as the app's layout does: one column, the bigger md title, then
 * lg's side-by-side ingredients and instructions.
 */
export const DEVICES_SHOT_BEATS = 6;

const CENTRE = { cx: 1290, cy: 540 };

export const DevicesShot: React.FC<{ beats?: BeatFrames }> = ({ beats = evenBeats() }) => {
  const frame = useCurrentFrame();
  const B = beats;
  const pulse = beatPulse(frame, B.slice(0, DEVICES_SHOT_BEATS));
  const toTablet = interpolate(frame, [B[1], B[1] + 9], [0, 1], { ...clamp, easing: snap });
  const toLaptop = interpolate(frame, [B[3], B[3] + 9], [0, 1], { ...clamp, easing: snap });
  const shape = toLaptop > 0 ? mixShape(TABLET, LAPTOP, toLaptop) : mixShape(PHONE, TABLET, toTablet);
  const width = Math.round(shape.w);
  // Status bar on the phone and tablet, browser toolbar on the laptop.
  const top = 44 + (76 - 44) * toLaptop;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop pulse={pulse * 0.5} drift={frame + 2000} />
      <StepCaption step={4} header="Any device" detail="Phone, tablet or laptop. The same library." at={B[0] + 2} />
      <Device shape={shape} cx={CENTRE.cx} cy={CENTRE.cy}>
        <ResponsiveRecipe width={width} top={top} />
        {width < 768 && <BottomNav active="recipes" />}
        {toLaptop < 0.5 ? <StatusBar /> : <BrowserChrome title={`${HERO.title} | NomNoms`} path={`/recipes/${HERO.slug}`} opacity={(toLaptop - 0.5) * 2} />}
      </Device>
    </AbsoluteFill>
  );
};
