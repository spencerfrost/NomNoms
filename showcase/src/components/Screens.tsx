import { ArrowLeft, Check, Clock, ExternalLink, Loader2, Pencil, Save, Search, Users } from "lucide-react";
import React from "react";
import { Img, staticFile } from "remotion";
import { formatAmountRange, HERO, HERO_INGREDIENTS, HERO_STEPS, image, Ingredient, Tile, tileColor } from "../data/recipes";
import { color, font } from "../theme";
import { Button, MenuButton, PAGE_W } from "./AppUi";

/** Two tiles a row with gap-3, inside the page padding. */
export const TILE_W = (PAGE_W - 12) / 2;

/** components/recipe-card.tsx */
export const RecipeTile: React.FC<{ tile: Tile; style?: React.CSSProperties }> = ({ tile, style }) => (
  <div
    style={{
      width: TILE_W,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      borderRadius: 24,
      padding: 8,
      background: tileColor(tile.slug),
      color: color.foreground,
      ...style,
    }}
  >
    <div style={{ position: "relative", width: TILE_W - 16, height: TILE_W - 16, borderRadius: 16, overflow: "hidden" }}>
      <Img src={staticFile(image(tile.slug))} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      {tile.time && (
        <span
          style={{
            position: "absolute",
            left: 8,
            top: 8,
            borderRadius: 999,
            background: "#2b1447",
            padding: "4px 10px",
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {tile.time}
        </span>
      )}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 6px 8px" }}>
      <div
        style={{
          fontFamily: font.display,
          fontSize: 18,
          lineHeight: 1.05,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {tile.title}
      </div>
      {tile.yield && <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden" }}>{tile.yield}</div>}
    </div>
  </div>
);

/** app/discover: the page header and the search form. */
export const DiscoverTop: React.FC<{ query: string; caret?: boolean; buttonScale?: number }> = ({
  query,
  caret,
  buttonScale = 1,
}) => (
  <>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div>
        <div style={{ fontFamily: font.display, fontSize: 30, lineHeight: 1.05 }}>Discover</div>
        <div style={{ color: color.mutedFg, fontSize: 16, lineHeight: 1.4, marginTop: 2 }}>
          Search the web for recipes, or paste a link to one.
        </div>
      </div>
      <div style={{ marginLeft: 16 }}>
        <MenuButton />
      </div>
    </div>
    <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
      <div
        style={{
          flex: 1,
          height: 48,
          borderRadius: 16,
          background: color.card,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          fontSize: 16,
          fontWeight: 500,
          color: query ? color.foreground : color.mutedFg,
          whiteSpace: "nowrap",
          overflow: "hidden",
          boxShadow: query ? `0 0 0 3px ${color.primary}` : "none",
        }}
      >
        {query || "e.g. chicken tikka masala, or https://…"}
        {caret && <span style={{ width: 2, height: 22, background: color.foreground, marginLeft: 1 }} />}
      </div>
      {/* The label is hidden below sm, so phones get the icon only. */}
      <Button scale={buttonScale} style={{ width: 52, padding: 0 }}>
        <Search size={16} />
      </Button>
    </div>
  </>
);

export interface SearchResult {
  slug: string;
  site: string;
  title: string;
  snippet: string;
}

/** components/discover/SearchResultCard.tsx */
export const ResultCard: React.FC<{ result: SearchResult; style?: React.CSSProperties }> = ({ result, style }) => (
  <div
    style={{
      display: "flex",
      gap: 12,
      borderRadius: 10,
      border: `1px solid ${color.border}`,
      background: color.card,
      padding: 12,
      ...style,
    }}
  >
    <div style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 6, overflow: "hidden", background: color.muted }}>
      <Img src={staticFile(image(result.slug))} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: 12, color: color.mutedFg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {result.site}
      </div>
      <div style={{ fontWeight: 500, lineHeight: 1.35, fontSize: 16 }}>{result.title}</div>
      <div
        style={{
          marginTop: 4,
          fontSize: 14,
          lineHeight: 1.4,
          color: color.mutedFg,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {result.snippet}
      </div>
    </div>
  </div>
);

export const RESULTS: SearchResult[] = [
  {
    slug: "thai-green-chicken-curry",
    site: "my-life-story-recipes.com",
    title: "Thai Green Chicken Curry",
    snippet: "Crunchy vegetables in a coconut green curry, ready in half an hour…",
  },
  {
    slug: "quinoa-jambalaya",
    site: "weeknight-wok.com",
    title: "Easy Green Curry with Quinoa",
    snippet: "A weeknight curry with whatever vegetables are in the fridge.",
  },
  {
    slug: "chicken-fried-rice",
    site: "rice-and-shine.kitchen",
    title: "Green Curry Fried Rice",
    snippet: "Leftover rice, a spoon of curry paste and ten minutes.",
  },
];

/** What a parsed preview shows: an ImportedRecipe, reduced to what's on screen. */
export interface PreviewRecipe {
  slug: string;
  site: string;
  title: string;
  description: string;
  /** "Prep 15 min · Cook 20 min" */
  times: string;
  servings: string;
  ingredients: Ingredient[];
  steps: string[];
}

export const HERO_PREVIEW: PreviewRecipe = {
  slug: HERO.slug,
  site: RESULTS[0].site,
  title: HERO.title,
  description: HERO.description,
  times: `Prep ${HERO.prepTime} · Cook ${HERO.cookTime}`,
  servings: "2 servings",
  ingredients: HERO_INGREDIENTS,
  steps: HERO_STEPS,
};

/** The preview's ingredients as RecipePreview lists them: bold quantity, then the name. */
const PreviewIngredients: React.FC<{ ingredients: Ingredient[] }> = ({ ingredients }) => (
  <div>
    <div style={{ fontWeight: 600, marginBottom: 8 }}>Ingredients ({ingredients.length})</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14, lineHeight: 1.4 }}>
      {ingredients.map((ing, i) => {
        const quantity = [formatAmountRange(ing), ing.unit].filter(Boolean).join(" ");
        return (
          <div key={i}>
            {quantity && <span style={{ fontWeight: 500 }}>{quantity} </span>}
            {ing.name}
          </div>
        );
      })}
    </div>
  </div>
);

export type SaveState = "idle" | "saving" | "saved";

/**
 * components/discover/RecipePreview.tsx. `reveal` (styles per part, 0–6) lets
 * the climax assemble it piece by piece.
 */
export const PreviewCard: React.FC<{
  recipe?: PreviewRecipe;
  reveal?: (part: number) => React.CSSProperties;
  save?: SaveState;
  saveScale?: number;
  backLabel?: string;
  /** md and up: a taller photo, and ingredients beside the steps. */
  wide?: boolean;
}> = ({ recipe = HERO_PREVIEW, reveal = () => ({}), save = "idle", saveScale = 1, backLabel = "Back to results", wide = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ ...reveal(0) }}>
      <Button variant="ghost" style={{ background: "transparent", paddingLeft: 12 }}>
        <ArrowLeft size={16} />
        {backLabel}
      </Button>
    </div>
    <div style={{ borderRadius: 24, background: color.card, overflow: "hidden", paddingBottom: 20, ...reveal(1) }}>
      <div style={{ height: wide ? 288 : 224, overflow: "hidden", ...reveal(2) }}>
        <Img src={staticFile(image(recipe.slug))} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ padding: "24px 20px 0", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={reveal(3)}>
          <div style={{ fontSize: 14, color: color.mutedFg }}>{recipe.site}</div>
          <div style={{ fontFamily: font.display, fontSize: 24, lineHeight: 1.1 }}>{recipe.title}</div>
          <div style={{ marginTop: 8, color: color.mutedFg, lineHeight: 1.45 }}>{recipe.description}</div>
          <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 14, color: color.mutedFg }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={16} />
              {recipe.times}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Users size={16} />
              {recipe.servings}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, ...reveal(4) }}>
          {save === "saved" ? (
            <Button>
              <Check size={16} />
              Saved · View recipe
            </Button>
          ) : (
            <Button scale={saveScale}>
              {save === "saving" ? <Loader2 size={16} /> : <Save size={16} />}
              {save === "saving" ? "Saving…" : "Save"}
            </Button>
          )}
          <Button variant="outline">
            <Pencil size={16} />
            Edit first
          </Button>
          <Button variant="outline">
            <ExternalLink size={16} />
            Open original
          </Button>
        </div>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: 24 }}>
        <div style={{ flex: 2, ...reveal(5) }}>
          <PreviewIngredients ingredients={recipe.ingredients} />
        </div>
        <div style={{ flex: 3, ...reveal(6) }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Steps ({recipe.steps.length})</div>
          <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8, fontSize: 14, lineHeight: 1.45 }}>
            {recipe.steps.slice(0, wide ? 3 : 2).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
        </div>
      </div>
    </div>
  </div>
);

/** RecipePreview while the import runs: a card of pulsing placeholder bars. */
export const PreviewLoading: React.FC<{ frame: number }> = ({ frame }) => {
  const o = 0.55 + Math.sin(frame / 5) * 0.25;
  const bar = (w: number | string, h: number): React.CSSProperties => ({
    width: w,
    height: h,
    borderRadius: 8,
    background: color.muted,
    opacity: o,
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ height: 44 }} />
      <div style={{ borderRadius: 24, background: color.card, overflow: "hidden", paddingBottom: 20 }}>
        <div style={{ ...bar("100%", 224), borderRadius: 0 }} />
        <div style={{ padding: "24px 20px 0", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={bar(120, 14)} />
          <div style={bar("80%", 26)} />
          <div style={bar("95%", 16)} />
          <div style={bar("70%", 16)} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <div style={{ ...bar(90, 44), borderRadius: 22 }} />
            <div style={{ ...bar(120, 44), borderRadius: 22 }} />
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={bar(`${85 - i * 9}%`, 14)} />
          ))}
        </div>
      </div>
    </div>
  );
};
