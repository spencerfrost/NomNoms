import { loadFont as loadBagel } from "@remotion/google-fonts/BagelFatOne";
import { loadFont as loadOnest } from "@remotion/google-fonts/Onest";

/** The app's "Bite" theme (app/globals.css, :root). */
export const color = {
  background: "#f1ecfb",
  foreground: "#2b1447",
  primary: "#2b1447",
  primaryFg: "#ffffff",
  secondary: "#ffb627",
  muted: "#e4dbf6",
  mutedFg: "#5a4775",
  accent: "#ff9cb8",
  card: "#ffffff",
  border: "#d9cef0",
  input: "#f1ecfb",
  mango: "#ffb627",
  pink: "#ff9cb8",
  mint: "#8fe0bf",
  sky: "#9cc9ff",
  /** The dark theme's background, for contrast moments. */
  night: "#1a0d2b",
};

export const TILES = [color.mango, color.pink, color.mint, color.sky] as const;

export const font = {
  /** Bagel Fat One has one weight; never fake bold on it. */
  display: loadBagel("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  body: loadOnest("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] }).fontFamily,
};
