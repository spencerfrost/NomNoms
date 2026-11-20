import { ArrowLeft, ChefHat, Clock, Minus, Plus } from "lucide-react";
import React from "react";
import { Img, staticFile } from "remotion";
import { formatAmountRange, HERO, HERO_INGREDIENTS, HERO_STEPS, image, scaleYield } from "../data/recipes";
import { color, font } from "../theme";
import { Button, MenuButton } from "./AppUi";
import { MULTIPLIERS } from "./RecipePage";

/**
 * app/recipes/[slug]/page.tsx for the hero curry at any screen width, with
 * the app's breakpoints: one column below lg (1024), with the bigger title
 * from md (768); from lg the header and photo share a row and the
 * ingredients sit beside the instructions (ScalableRecipe.tsx, RecipeLayout.tsx).
 */
export const ResponsiveRecipe: React.FC<{ width: number; top: number; multiplier?: number }> = ({ width, top, multiplier = 2 }) => {
  const md = width >= 768;
  const lg = width >= 1024;
  const gap = lg ? 24 : 16;
  const inner = Math.min(width - 32, 896);

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

  const photo = (
    <div style={{ height: lg ? 256 : 224, borderRadius: 24, overflow: "hidden", flexShrink: 0 }}>
      <Img src={staticFile(image(HERO.slug))} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
  const header = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontFamily: font.display, fontSize: md ? 60 : 36, lineHeight: 1.05 }}>{HERO.title}</div>
      <div style={{ fontSize: 18, lineHeight: 1.5, color: color.mutedFg }}>{HERO.description}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <div style={fact}>
          <ChefHat size={16} />
          Yields: {scaleYield(HERO.yield!, multiplier)}
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
  );
  const card: React.CSSProperties = { borderRadius: 24, background: color.card, padding: "20px 0" };
  const cardTitle: React.CSSProperties = { padding: "0 20px", fontFamily: font.display, fontSize: 24, lineHeight: 1 };
  const ingredients = (
    <div style={card}>
      <div style={cardTitle}>Ingredients</div>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {[Minus, null, Plus].map((Icon, i) =>
              Icon ? (
                <div key={i} style={{ width: 44, height: 44, borderRadius: 22, background: color.background, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} strokeWidth={3} />
                </div>
              ) : (
                <div key={i} style={{ minWidth: 64, textAlign: "center", fontFamily: font.display, fontSize: 24 }}>
                  {multiplier}×
                </div>
              )
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
            {MULTIPLIERS.map((m) => (
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
                  background: m === multiplier ? color.primary : color.background,
                  color: m === multiplier ? color.primaryFg : color.foreground,
                }}
              >
                {m}×
              </div>
            ))}
          </div>
        </div>
        {HERO_INGREDIENTS.map((ing, i) => (
          <div key={i} style={{ borderTop: `2px solid ${color.background}`, minHeight: 48, display: "flex", alignItems: "center", gap: 12, padding: "8px 0", fontSize: 18, lineHeight: 1.375 }}>
            <div style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 4, border: `2px solid ${color.border}`, background: "#fff" }} />
            <span style={{ width: 96, flexShrink: 0, fontWeight: 700 }}>{[formatAmountRange(ing, multiplier), ing.unit].filter(Boolean).join(" ")}</span>
            <span style={{ fontWeight: 500 }}>{ing.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
  const instructions = (
    <div style={card}>
      <div style={cardTitle}>Instructions</div>
      <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 20 }}>
        {HERO_STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 16 }}>
            <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 20, background: color.mint, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.display, fontSize: 20 }}>
              {i + 1}
            </span>
            <span style={{ fontSize: 18, lineHeight: 1.625, paddingTop: 4 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: "absolute", left: 0, top: top + (md ? 32 : 40), width, display: "flex", justifyContent: "center" }}>
      <div style={{ width: inner }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Button variant="ghost" style={{ paddingLeft: 16 }}>
            <ArrowLeft size={20} />
            Back to Recipes
          </Button>
          <MenuButton />
        </div>
        {lg ? (
          <div style={{ display: "flex", gap, marginBottom: 20 }}>
            <div style={{ flex: 2 }}>{header}</div>
            <div style={{ flex: 1 }}>{photo}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap, marginBottom: 20 }}>
            {photo}
            {header}
          </div>
        )}
        <div style={{ marginBottom: 20 }}>
          <Button size="lg" style={md ? {} : { width: "100%" }}>
            <ChefHat size={20} />
            Start cooking
          </Button>
        </div>
        {lg ? (
          <div style={{ display: "flex", gap, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>{ingredients}</div>
            <div style={{ flex: 2 }}>{instructions}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap }}>
            {ingredients}
            {instructions}
          </div>
        )}
      </div>
    </div>
  );
};
