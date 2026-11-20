import { ArrowLeft, ChefHat, Clock, Edit, Minus, Plus } from "lucide-react";
import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { formatAmountRange, HERO, HERO_INGREDIENTS, image, Ingredient, scaleYield } from "../data/recipes";
import { clamp, snap } from "../motion";
import { color, font } from "../theme";
import { Button, MenuButton, Page } from "./AppUi";

/**
 * app/recipes/[slug]/page.tsx for the hero curry, on a phone: header, photo,
 * title and facts, Start cooking, and the ingredients card with its scale
 * controls (components/scale-controls.tsx, RecipeIngredientsList.tsx).
 */

export const MULTIPLIERS = [0.5, 1, 1.5, 2, 2.5, 3];
const PAGE_TOP = 84;

/**
 * Screen positions (before scrolling) of what gets tapped. Measured from the
 * layout below: header 60, photo 224, gap 16, title block 226, mb-5,
 * Start cooking 56, mb-5, then the card.
 */
export const RECIPE_LAYOUT = {
  pageTop: PAGE_TOP,
  startCooking: { x: 195, y: PAGE_TOP + 60 + 224 + 16 + 226 + 20 + 28 },
  cardTop: PAGE_TOP + 60 + 224 + 16 + 226 + 20 + 56 + 20,
};
/** Centre of preset button `k` (0 = 0.5×) in screen x, and the presets row's y. */
export const presetX = (k: number) => 16 + 20 + k * ((318 - 30) / 6 + 6) + (318 - 30) / 12;
export const PRESET_Y = RECIPE_LAYOUT.cardTop + 20 + 24 + 20 + 44 + 12 + 22;

/** A value that rolls over when it changes: the old one slides up and out, the new one up in. */
const Roll: React.FC<{ from: string; to: string; t: number; style?: React.CSSProperties }> = ({ from, to, t, style }) => {
  if (from === to || t >= 1) return <span style={style}>{to}</span>;
  return (
    <span style={{ position: "relative", display: "inline-block", overflow: "hidden", verticalAlign: "bottom", ...style }}>
      <span style={{ visibility: "hidden" }}>{t < 0.5 ? from : to}</span>
      <span style={{ position: "absolute", left: 0, top: 0, transform: `translateY(${-t * 100}%)`, opacity: 1 - t, whiteSpace: "inherit" }}>{from}</span>
      <span style={{ position: "absolute", left: 0, top: 0, transform: `translateY(${(1 - t) * 100}%)`, opacity: t, whiteSpace: "inherit" }}>{to}</span>
    </span>
  );
};

/** The multiplier over time: `changes` are [frame, value] in order. */
export const multiplierAt = (frame: number, changes: [number, number][], initial = 1) => {
  let current = initial;
  let previous = initial;
  let at = -Infinity;
  for (const [f, v] of changes) {
    if (frame >= f) {
      previous = current;
      current = v;
      at = f;
    }
  }
  return { current, previous, at };
};

const fact: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  borderRadius: 999,
  background: color.primary,
  padding: "6px 12px",
  fontSize: 14,
  fontWeight: 700,
  color: color.primaryFg,
};

export const RecipePage: React.FC<{
  frame: number;
  scroll?: number;
  /** Multiplier changes: [frame, value]. */
  changes?: [number, number][];
  startScale?: number;
  presetScale?: (k: number) => number;
}> = ({ frame, scroll = 0, changes = [], startScale = 1, presetScale = () => 1 }) => {
  const { current, previous, at } = multiplierAt(frame, changes);
  const rollAt = (delay: number) =>
    Number.isFinite(at) ? interpolate(frame, [at + delay, at + delay + 5], [0, 1], { ...clamp, easing: snap }) : 1;
  const ingredients: Ingredient[] = HERO_INGREDIENTS;
  return (
    <Page top={PAGE_TOP} scroll={scroll}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="ghost" style={{ paddingLeft: 16 }}>
            <ArrowLeft size={20} />
            Back to Recipes
          </Button>
        </div>
        <MenuButton />
      </div>
      <div style={{ height: 224, borderRadius: 24, overflow: "hidden" }}>
        <Img src={staticFile(image(HERO.slug))} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ marginTop: 16, height: 226, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontFamily: font.display, fontSize: 36, lineHeight: 1.05 }}>{HERO.title}</div>
        <div style={{ fontSize: 18, lineHeight: 1.5, color: color.mutedFg }}>{HERO.description}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <div style={fact}>
            <ChefHat size={16} />
            <span>
              Yields:{" "}
              <Roll from={scaleYield(HERO.yield!, previous)} to={scaleYield(HERO.yield!, current)} t={rollAt(0)} />
            </span>
          </div>
          <div style={fact}>
            <Clock size={16} />
            Prep: {HERO.prepTime}
          </div>
          <div style={fact}>
            <Clock size={16} />
            Cook: {HERO.cookTime}
          </div>
          {["chicken", "rice"].map((t) => (
            <div key={t} style={{ borderRadius: 999, background: color.card, padding: "6px 12px", fontSize: 14, fontWeight: 600 }}>
              {t}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <Button size="lg" scale={startScale} style={{ width: "100%" }}>
          <ChefHat size={20} />
          Start cooking
        </Button>
      </div>
      <div style={{ marginTop: 20, borderRadius: 24, background: color.card, padding: "20px 0" }}>
        <div style={{ padding: "0 20px", fontFamily: font.display, fontSize: 24, lineHeight: 1 }}>Ingredients</div>
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: color.background, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Minus size={20} strokeWidth={3} />
              </div>
              <div style={{ minWidth: 64, textAlign: "center", fontFamily: font.display, fontSize: 24 }}>
                <Roll from={`${previous}×`} to={`${current}×`} t={rollAt(0)} />
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: color.background, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={20} strokeWidth={3} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
              {MULTIPLIERS.map((m, k) => (
                <div
                  key={m}
                  style={{
                    height: 44,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 600,
                    background: m === current ? color.primary : color.background,
                    color: m === current ? color.primaryFg : color.foreground,
                    transform: `scale(${presetScale(k)})`,
                  }}
                >
                  {m}×
                </div>
              ))}
            </div>
          </div>
          {ingredients.map((ing, i) => {
            const amount = (mult: number) => [formatAmountRange(ing, mult), ing.unit].filter(Boolean).join(" ");
            return (
              <div key={i} style={{ borderTop: `2px solid ${color.background}`, minHeight: 48, display: "flex", alignItems: "center", gap: 12, padding: "8px 0", fontSize: 18, lineHeight: 1.375 }}>
                <div style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 4, border: `2px solid ${color.border}`, background: "#fff" }} />
                <span style={{ width: 96, flexShrink: 0, fontWeight: 700 }}>
                  <Roll from={amount(previous)} to={amount(current)} t={rollAt(1 + i)} />
                </span>
                <span style={{ fontWeight: 500 }}>{ing.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
};
