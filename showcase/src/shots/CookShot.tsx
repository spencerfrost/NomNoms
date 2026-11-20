import { X } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BeatFrames, evenBeats } from "../beats";
import { BottomNav, Button, Tap } from "../components/AppUi";
import { Backdrop } from "../components/Backdrop";
import { Phone, PHONE_HOME, SCREEN_H, StatusBar } from "../components/Phone";
import { RECIPE_LAYOUT, RecipePage } from "../components/RecipePage";
import { StepCaption } from "../components/StepCaption";
import { HERO, HERO_STEPS } from "../data/recipes";
import { beatPulse, clamp, pop, press, snap } from "../motion";
import { color, font } from "../theme";
import { SCALE_SCROLL } from "./ScaleShot";

/**
 * STEP 3, COOK: the camera pulls back out of the ingredients, Start cooking
 * is tapped and the full-screen cooking view slides up; Next step is pressed
 * on every beat through all six steps. Wording and layout from
 * components/recipe/display/CookMode.tsx (it also holds a screen wake lock).
 */
export const COOK_SHOT_BEATS = 8;
/** Beats between steps. */
const STEP_BEATS = 1;

const STEPS_FROM = 2;
const NEXT_BUTTON = { x: 258, y: SCREEN_H - 24 - 32 };

/** CookMode at step `index`, which entered at frame `since`. */
const CookMode: React.FC<{ index: number; since: number; nextScale: number }> = ({ index, since, nextScale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = HERO_STEPS.length;
  const isLast = index === total - 1;
  const enter = interpolate(frame, [since, since + 6], [0, 1], { ...clamp, easing: snap });
  const num = pop(frame, since, fps, 380);
  const next = isLast ? null : HERO_STEPS[index + 1];
  return (
    <div style={{ position: "absolute", inset: 0, background: color.background, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "84px 16px 16px", display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: color.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={20} strokeWidth={2.8} />
          </div>
          <Button variant="ghost">Check ingredients</Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: color.mutedFg }}>{HERO.title}</div>
          <div style={{ height: 10, borderRadius: 999, background: color.card, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                background: color.primary,
                width: `${((index + enter) / total) * 100}%`,
              }}
            />
          </div>
        </div>
        <div
          style={{
            minHeight: 288,
            flexShrink: 0,
            borderRadius: 32,
            background: color.mint,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ fontFamily: font.display, fontSize: 24, lineHeight: 1 }}>
            Step{" "}
            <span style={{ fontSize: 60, display: "inline-block", transform: `scale(${0.5 + num * 0.5})` }}>{index + 1}</span> of {total}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              lineHeight: 1.375,
              opacity: enter,
              transform: `translateX(${(1 - enter) * 60}px)`,
            }}
          >
            {HERO_STEPS[index]}
          </div>
        </div>
        {next && (
          <div style={{ flexShrink: 0, borderRadius: 24, background: color.card, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6, opacity: enter }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: color.mutedFg }}>Up next</div>
            <div style={{ fontWeight: 500, lineHeight: 1.6 }}>{next}</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, padding: "8px 16px 24px", background: color.background }}>
        <Button variant="ghost" size="lg" style={{ flex: 1, height: 64, opacity: index === 0 ? 0.5 : 1 }}>
          Back
        </Button>
        <Button size="lg" scale={nextScale} style={{ flex: 2, height: 64 }}>
          {isLast ? "Done" : "Next step"}
        </Button>
      </div>
    </div>
  );
};

export const CookShot: React.FC<{ beats?: BeatFrames }> = ({ beats = evenBeats() }) => {
  const frame = useCurrentFrame();
  const B = beats;
  const pulse = beatPulse(frame, B.slice(0, COOK_SHOT_BEATS));
  // Out of SCALE's close-up, back to the whole phone.
  const pull = interpolate(frame, [0, 7], [0, 1], { ...clamp, easing: snap });
  const scale = 1.55 + (PHONE_HOME.scale - 1.55) * pull;
  const cx = PHONE_HOME.cx + 60 * (1 - pull);
  const cy = 540 - 104 * 1.6 * (scale - PHONE_HOME.scale);
  const tapStart = B[1];
  const open = interpolate(frame, [tapStart + 3, B[STEPS_FROM]], [0, 1], { ...clamp, easing: snap });
  const doneAt = B[STEPS_FROM + HERO_STEPS.length * STEP_BEATS];
  const close = interpolate(frame, [doneAt + 4, doneAt + 11], [0, 1], { ...clamp, easing: snap });
  // Step i shows from beat STEPS_FROM + i * STEP_BEATS; the last tap is Done.
  let index = 0;
  for (let i = 0; i < HERO_STEPS.length; i++) if (frame >= B[STEPS_FROM + i * STEP_BEATS]) index = i;
  const since = B[STEPS_FROM + index * STEP_BEATS];
  const taps = HERO_STEPS.map((_, i) => B[STEPS_FROM + (i + 1) * STEP_BEATS]);
  const nextScale = taps.reduce((s, t) => s * press(frame, t - 3), 1);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop pulse={pulse * 0.5} drift={frame + 1800} />
      <StepCaption step={3} header="Cook mode" detail="One step at a time. The screen stays on." at={B[0] + 2} />
      <Phone scale={scale} cx={cx} cy={cy}>
        <RecipePage frame={frame} scroll={SCALE_SCROLL} changes={[[-100, 2]]} startScale={press(frame, tapStart)} />
        <BottomNav active="recipes" />
        {open > 0 && close < 1 && (
          <div style={{ position: "absolute", inset: 0, zIndex: 50, transform: `translateY(${(1 - open + close) * SCREEN_H}px)` }}>
            <CookMode index={index} since={index === 0 ? B[STEPS_FROM] - 4 : since} nextScale={nextScale} />
          </div>
        )}
        <StatusBar />
        <Tap frame={frame} at={tapStart} x={195} y={RECIPE_LAYOUT.startCooking.y - SCALE_SCROLL} />
        {taps.map((t) => (
          <Tap key={t} frame={frame} at={t - 3} x={NEXT_BUTTON.x} y={NEXT_BUTTON.y} />
        ))}
      </Phone>
    </AbsoluteFill>
  );
};
