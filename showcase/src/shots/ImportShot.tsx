import { Bookmark, Search } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BeatFrames, evenBeats } from "../beats";
import { Button, MenuButton, Tap } from "../components/AppUi";
import { Backdrop } from "../components/Backdrop";
import { BrowserChrome, Device, LAPTOP } from "../components/Devices";
import { PreviewCard, PreviewLoading, PreviewRecipe, SaveState } from "../components/Screens";
import { StepCaption } from "../components/StepCaption";
import { beatPulse, clamp, pop, press, snap } from "../motion";
import { color, font } from "../theme";

/**
 * STEP 5, IMPORT, on the laptop: a link is pasted into Discover, Preview, the
 * parsed recipe builds, Save, toast. Wording from DiscoverClient.tsx,
 * ClipperHelp.tsx and RecipePreview.tsx.
 */
export const IMPORT_SHOT_BEATS = 6;

const SITE = "sweet-tooth-diaries.com";
const LINK = `https://${SITE}/old-fashioned-cheesecake`;
/** Discover: container max-w-3xl, py-8, under the browser toolbar. */
const TOP = 76 + 32;
const INNER = 768 - 32;
const LEFT = (LAPTOP.w - INNER) / 2;
const PREVIEW_BUTTON = { x: LEFT + INNER - 56, y: TOP + 74 + 24 };
const SAVE_BUTTON = { x: LEFT + 20 + 45, y: 0 };

/** The seed Old Fashioned Cheesecake, as the parser reads its page (group headers dropped). */
const CHEESECAKE: PreviewRecipe = {
  slug: "old-fashioned-cheesecake",
  site: SITE,
  title: "Old Fashioned Cheesecake",
  description: "A classic baked cheesecake with a sour cream topping.",
  times: "Prep 15 min · Cook 55 min",
  servings: "8 servings",
  ingredients: [
    { amount: 1.5, unit: "cup", name: "graham cracker crumbs" },
    { amount: 0.25, unit: "tsp", name: "ground cinnamon" },
    { amount: 0.25, unit: "cup", name: "butter, melted" },
    { amount: 1.5, unit: "lb", name: "cream cheese" },
    { amount: 1, unit: "cup", name: "sugar" },
    { amount: 3, unit: "", name: "eggs" },
    { amount: 0.5, unit: "cup", name: "sour cream" },
  ],
  steps: [
    "Combine graham cracker crumbs with cinnamon and butter. Press into the bottom of a 9-inch (23 cm) springform pan.",
    "For the filling, beat cream cheese with sugar. Add eggs one at a time, beating well after each addition. Stir in vanilla extract and sour cream.",
    "Bake in a preheated 350 °F (180 °C) oven for 45 to 50 min or until just set when gently shaken.",
  ],
};

export const ImportShot: React.FC<{ beats?: BeatFrames }> = ({ beats = evenBeats() }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const B = beats;
  const pulse = beatPulse(frame, B.slice(0, IMPORT_SHOT_BEATS));
  const pasted = frame >= B[1];
  const pasteFlash = interpolate(frame - B[1], [0, 10], [1, 0], clamp);
  const previewing = frame >= B[2] + 3;
  const built = frame >= B[3];
  const reveal = (part: number): React.CSSProperties => {
    const p = pop(frame, B[3] + part * 1.2, fps, 340);
    return { opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 30}px)` };
  };
  const save: SaveState = frame >= B[5] ? "saved" : frame >= B[4] + 2 ? "saving" : "idle";
  const toast = pop(frame, B[5], fps, 300);
  // The Save button's height on the page: under the back link, the photo and the title block.
  const saveY = TOP + 74 + 24 + 60 + 288 + 24 + 150 + 22;
  const scroll = interpolate(frame, [B[4] - 8, B[4] - 2], [0, 260], { ...clamp, easing: snap });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop pulse={pulse * 0.5} drift={frame + 2400} />
      <StepCaption step={5} header="Import any recipe" detail="Paste a link. Get just the recipe." at={B[0] + 2} />
      <Device shape={LAPTOP} cx={1290} cy={540}>
        <div style={{ position: "absolute", left: LEFT, top: TOP, width: INNER, transform: `translateY(${-scroll}px)` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: font.display, fontSize: 30, lineHeight: 1.05 }}>Discover</div>
              <div style={{ color: color.mutedFg, fontSize: 16, marginTop: 2 }}>Search the web for recipes, or paste a link to one.</div>
            </div>
            <MenuButton />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <div
              style={{
                flex: 1,
                height: 48,
                borderRadius: 16,
                background: color.card,
                // The pasted link flashes mango for a moment.
                boxShadow: pasted ? `0 0 0 3px ${color.primary}, inset 0 0 0 100px rgba(255,182,39,${pasteFlash * 0.45})` : "none",
                padding: "0 16px",
                display: "flex",
                alignItems: "center",
                fontSize: 16,
                fontWeight: 500,
                color: pasted ? color.foreground : color.mutedFg,
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {pasted ? LINK : "e.g. chicken tikka masala, or https://…"}
            </div>
            <Button scale={press(frame, B[2])}>
              <Search size={16} />
              {pasted ? "Preview" : "Search"}
            </Button>
          </div>
          {!previewing && (
            <div style={{ borderRadius: 24, background: color.card, padding: 20, fontSize: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Save from any site</div>
              <div style={{ color: color.mutedFg, marginTop: 6 }}>Found a recipe while browsing? Send it here to preview and save.</div>
              <div style={{ marginTop: 14, fontWeight: 500 }}>Desktop</div>
              <div style={{ color: color.mutedFg, marginBottom: 8 }}>Drag this button to your bookmarks bar, then click it on any recipe page.</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 6, border: `1px solid ${color.border}`, background: color.secondary, padding: "6px 12px", fontWeight: 500 }}>
                <Bookmark size={16} />
                Save to NomNoms
              </div>
            </div>
          )}
          {previewing &&
            (built ? (
              <PreviewCard recipe={CHEESECAKE} reveal={reveal} save={save} saveScale={press(frame, B[4])} backLabel="Close preview" wide />
            ) : (
              <PreviewLoading frame={frame} />
            ))}
        </div>
        {/* Sonner's toast: bottom right on wide screens */}
        {frame >= B[5] && (
          <div
            style={{
              position: "absolute",
              right: 24,
              bottom: 24,
              width: 356,
              zIndex: 70,
              borderRadius: 12,
              background: color.card,
              border: `1px solid ${color.border}`,
              boxShadow: "0 8px 24px rgba(43,20,71,0.18)",
              padding: 16,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              fontWeight: 500,
              transform: `translateY(${(1 - toast) * 120}px)`,
            }}
          >
            <span style={{ width: 20, height: 20, borderRadius: 10, background: color.foreground, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✓</span>
            <span style={{ flex: 1 }}>Saved “{CHEESECAKE.title}”</span>
            <span style={{ background: color.primary, color: color.primaryFg, borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>View</span>
          </div>
        )}
        <BrowserChrome title="Discover | NomNoms" path="/discover" />
        <Tap frame={frame} at={B[2]} x={PREVIEW_BUTTON.x} y={PREVIEW_BUTTON.y} />
        <Tap frame={frame} at={B[4]} x={SAVE_BUTTON.x} y={saveY - 260} />
      </Device>
    </AbsoluteFill>
  );
};
