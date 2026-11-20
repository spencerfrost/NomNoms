import { Search } from "lucide-react";
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BeatFrames, evenBeats } from "../beats";
import { BottomNav, MenuButton, Page, PAGE_X, Tap } from "../components/AppUi";
import { Backdrop } from "../components/Backdrop";
import { Phone, PHONE_HOME, StatusBar } from "../components/Phone";
import { RecipeTile, TILE_W } from "../components/Screens";
import { StepCaption } from "../components/StepCaption";
import { HERO, LIBRARY, Tile } from "../data/recipes";
import { beatPulse, clamp, pop, press, snap, typed } from "../motion";
import { color, font } from "../theme";

/**
 * STEP 1, LIBRARY: the camera pulls back onto the home page as the grid pops
 * in, a search for "chicken" keeps only the matches (French onion soup too:
 * its stock is an ingredient), and the curry is tapped.
 * Wording from app/page.tsx and components/recipe-library.tsx.
 */
export const LIBRARY_SHOT_BEATS = 8;

/** Home page: container pt-10 under the status bar. */
const PAGE_TOP = 84;
const GRID_TOP = 50 + 16 + 56 + 16;
const ROW_H = 240;
const GAP = 12;
const QUERY = "chicken";

const slot = (i: number) => ({ x: (i % 2) * (TILE_W + GAP), y: Math.floor(i / 2) * (ROW_H + GAP) });

export const LibraryShot: React.FC<{ beats?: BeatFrames }> = ({ beats = evenBeats() }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const B = beats;
  const pulse = beatPulse(frame, B.slice(0, LIBRARY_SHOT_BEATS));

  // Camera pull-back onto the phone.
  const pull = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: snap });
  const scale = PHONE_HOME.scale * (2.3 - pull * 1.3);
  const text = typed(QUERY, frame, B[2], B[3] + 4);
  const searching = frame >= B[3] + 4;
  const filter = interpolate(frame, [B[4], B[4] + 7], [0, 1], { ...clamp, easing: snap });
  const gridDrop = interpolate(frame, [B[3] + 4, B[3] + 9], [0, 36], { ...clamp, easing: snap });

  const all: Tile[] = [HERO, ...LIBRARY];
  const matches = all.filter((t) => t.chicken);
  const tapAt = B[6];

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop pulse={pulse * 0.5} drift={frame + 1200} />
      <StepCaption step={1} header="Your library" detail="Search by name, tag or ingredient." at={B[0] + 2} />
      <Phone scale={scale} cy={PHONE_HOME.cy + (1 - pull) * 300}>
        <StatusBar />
        <Page top={PAGE_TOP}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: font.display, fontSize: 48, lineHeight: 1.05 }}>
              <Img src={staticFile("images/logo-mark.svg")} style={{ width: "1em", height: "1em" }} />
              NomNoms
            </div>
            <MenuButton />
          </div>
          <div style={{ position: "relative", height: 56, borderRadius: 20, background: color.card, display: "flex", alignItems: "center", paddingLeft: 48, fontSize: 18, fontWeight: 500, color: text ? color.foreground : color.mutedFg }}>
            <Search size={20} strokeWidth={2.5} color={color.foreground} style={{ position: "absolute", left: 16 }} />
            {text || "Search recipes, ingredients or tags"}
            {frame >= B[2] && frame < B[5] && <span style={{ width: 2, height: 24, background: color.foreground, marginLeft: 1 }} />}
          </div>
          {searching && (
            <div style={{ marginTop: 16, fontSize: 14, fontWeight: 500, color: color.mutedFg }}>Searching for &ldquo;{QUERY}&rdquo;...</div>
          )}
        </Page>
        <div style={{ position: "absolute", left: PAGE_X, top: PAGE_TOP + GRID_TOP + gridDrop }}>
          {all.map((t, i) => {
            const appear = pop(frame, i * 0.7, fps, 340);
            const m = matches.indexOf(t);
            const from = slot(i);
            const to = m >= 0 ? slot(m) : from;
            const x = from.x + (to.x - from.x) * filter;
            const y = from.y + (to.y - from.y) * filter;
            const gone = m < 0 ? filter : 0;
            const s = appear * (1 - gone) * (t === HERO ? press(frame, tapAt) : 1);
            if (s <= 0.001) return null;
            return (
              <div
                key={t.slug}
                style={{ position: "absolute", left: x, top: y, transform: `scale(${s})`, opacity: Math.min(1, appear * 2) * (1 - gone) }}
              >
                <RecipeTile tile={t} style={{ height: ROW_H }} />
              </div>
            );
          })}
        </div>
        <BottomNav active="recipes" />
        <Tap frame={frame} at={tapAt} x={PAGE_X + TILE_W / 2} y={PAGE_TOP + GRID_TOP + 36 + 90} />
      </Phone>
    </AbsoluteFill>
  );
};
