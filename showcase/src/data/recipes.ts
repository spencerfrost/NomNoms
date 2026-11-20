import { TILES } from "../theme";

/**
 * The recipes on screen. Library tiles come from the seed recipes in
 * data/recipes/*.json (titles, yields, times and photos as stored). The hero
 * curry's ingredients are written the way lib/ingredient-parser.ts reads the
 * original page, with names shortened to fit one line; the "2-3" chilis range
 * is ours, to show ranges scaling.
 */

export interface Tile {
  slug: string;
  title: string;
  yield?: string;
  time?: string;
  /** Matches a search for "chicken" (title, tag or ingredient). */
  chicken?: boolean;
}

export const image = (slug: string) => `images/recipes/${slug}.jpg`;

/** The seed recipe has no times; these are what the import fills in from the page. */
export const HERO: Tile & { description: string; prepTime: string; cookTime: string } = {
  slug: "thai-green-chicken-curry",
  title: "Thai Green Chicken Curry",
  yield: "2 servings",
  time: "20 min",
  prepTime: "15 min",
  cookTime: "20 min",
  description: "Crunchy vegetables in a coconut green curry, ready in half an hour.",
  chicken: true,
};

/** The library grid before the curry is saved, in the order the home page shows them. */
export const LIBRARY: Tile[] = [
  { slug: "marry-me-chicken", title: "Marry Me Chicken", yield: "Servings 4 servings", time: "30 minutes", chicken: true },
  { slug: "classic-waffles", title: "Classic Waffles", yield: "5", time: "15 mins" },
  { slug: "french-onion-soup", title: "French Onion Soup", yield: "4 to 6 servings", time: "60 mins", chicken: true },
  { slug: "chicken-fried-rice", title: "Chicken Fried Rice", yield: "6 to 8 servings", time: "15 mins", chicken: true },
  { slug: "easy-tortellini-bake", title: "Easy Tortellini Bake", yield: "Yield: 4 servings", time: "10 minutes" },
  { slug: "crispy-rhubarb-lemon-chicken-bake", title: "Crispy Rhubarb Lemon Chicken Bake", yield: "Yield: 5", time: "25 minutes", chicken: true },
  { slug: "quinoa-jambalaya", title: "Quinoa Jambalaya", yield: "6", time: "30 mins", chicken: true },
  { slug: "banana-banana-bread", title: "Banana Banana Bread", yield: "12", time: "1 hr 5 mins" },
];

/** Photos for the open's collage. */
export const COLLAGE = [
  "classic-waffles",
  "french-onion-soup",
  "best-strawberry-rhubarb-pie",
  "cherry-clafoutis",
  "marry-me-chicken",
  "chicken-fried-rice",
  "slow-cooker-texas-pulled-pork",
  "old-fashioned-cheesecake",
  "easy-tortellini-bake",
  "quinoa-jambalaya",
  "strawberry-rhubarb-rolled-pavlova",
  "easy-slow-cooker-mozzarella-stuffed-meatballs-and-sauce",
];

/** components/recipe-card.tsx: a recipe keeps its tile colour from its slug. */
export const tileColor = (slug: string) => {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return TILES[hash % TILES.length];
};

export interface Ingredient {
  amount: number;
  amountMax?: number;
  unit: string;
  name: string;
}

export const HERO_INGREDIENTS: Ingredient[] = [
  { amount: 1, unit: "lb", name: "chicken thighs" },
  { amount: 2, amountMax: 3, unit: "", name: "green chilis" },
  { amount: 2, unit: "Tbsp", name: "coconut oil" },
  { amount: 1.5, unit: "Tbsp", name: "fresh ginger" },
  { amount: 1.5, unit: "cups", name: "red bell pepper" },
  { amount: 3, unit: "Tbsp", name: "green curry paste" },
  { amount: 1, unit: "can", name: "coconut milk" },
  { amount: 0, unit: "", name: "lime, to taste" },
];

/** The seed recipe's steps, as stored. */
export const HERO_STEPS = [
  "Heat 1 tbsp of coconut oil in a wok or deep skillet. Add chicken thighs to the pan and cook for a few minutes until almost cooked all the way. Season to taste with salt and pepper. Remove from the pan and set aside.",
  "In the same pan, heat the remaining tablespoon of oil and add the green chilies, shallot, bell peppers, carrots, green onions. Cook for about 30 seconds, then add the ginger and garlic.",
  "Add the Thai Green Curry paste and cook for a minute until everything comes together.",
  "Add the coconut milk to the pan and mix thoroughly. Let the curry cook for a few minutes until bubbling hot. Squeeze in some fresh lime.",
  "Add in the broccolini and the snap peas along with the chicken that you par cooked earlier. Let everything poach in the hot curry until the chicken is finished cooking fully.",
  "Serve hot over jasmine rice. Top with all the garnishes - red Thai peppers, green onions, cucumbers, more basil and a squeeze of lime.",
];

/** lib/amount-utils.ts formatDecimalAsFraction */
const fraction = (decimal: number): string => {
  if (decimal === 0) return "0";
  const whole = Math.floor(decimal);
  const f = decimal - whole;
  if (f < 1e-6) return String(whole);
  const common: [number, string][] = [
    [1 / 8, "1/8"],
    [1 / 4, "1/4"],
    [1 / 3, "1/3"],
    [3 / 8, "3/8"],
    [1 / 2, "1/2"],
    [5 / 8, "5/8"],
    [2 / 3, "2/3"],
    [3 / 4, "3/4"],
    [7 / 8, "7/8"],
  ];
  for (const [v, d] of common) if (Math.abs(f - v) < 1e-6) return whole > 0 ? `${whole} ${d}` : d;
  return decimal.toFixed(2).replace(/\.?0+$/, "");
};

/** lib/amount-utils.ts formatAmountRange: "2", "1 1/2", "2–3"; "" for no amount. */
export const formatAmountRange = ({ amount, amountMax }: Ingredient, multiplier = 1) => {
  if (!(amount > 0)) return "";
  const low = fraction(amount * multiplier);
  if (amountMax === undefined || !(amountMax > amount)) return low;
  return `${low}–${fraction(amountMax * multiplier)}`;
};

/** components/recipe/display/RecipeHeader.tsx: the yield's numbers scale too. */
export const scaleYield = (y: string, multiplier: number) =>
  y.replace(/\d+/g, (m) => String(Math.round(parseInt(m) * multiplier)));
