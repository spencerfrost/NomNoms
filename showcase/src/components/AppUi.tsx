import { LayoutGrid, Menu, Plus, User } from "lucide-react";
import React from "react";
import { interpolate } from "remotion";
import { clamp } from "../motion";
import { color, font } from "../theme";
import { SCREEN_W } from "./Phone";

/**
 * Pieces of the app's UI redrawn at their real sizes (Tailwind classes noted
 * beside each). Screen content is laid out in the phone's CSS pixels.
 */

/** components/bottom-nav.tsx: the phone tab bar. */
export const BottomNav: React.FC<{ active?: "recipes" | "add" | "you" }> = ({ active }) => {
  const tab = (on: boolean): React.CSSProperties => ({
    width: 96,
    height: 56,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    fontSize: 12,
    fontWeight: 700,
    color: on ? color.foreground : color.mutedFg,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "28px 28px 0 0",
        background: color.card,
        padding: "8px 28px 26px",
      }}
    >
      <div style={tab(active === "recipes")}>
        <LayoutGrid size={24} />
        Recipes
      </div>
      <div
        style={{
          marginTop: -36,
          width: 64,
          height: 64,
          borderRadius: 32,
          border: `5px solid ${color.background}`,
          background: color.primary,
          color: color.primaryFg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus size={28} strokeWidth={3} />
      </div>
      <div style={tab(active === "you")}>
        <User size={24} />
        You
      </div>
    </div>
  );
};

/** The hamburger button in components/page-header.tsx (ghost icon button, bg-card). */
export const MenuButton: React.FC = () => (
  <div
    style={{
      width: 44,
      height: 44,
      flexShrink: 0,
      borderRadius: 22,
      background: color.card,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: color.foreground,
    }}
  >
    <Menu size={20} />
  </div>
);

type ButtonVariant = "default" | "outline" | "ghost" | "secondary";

/** components/ui/button.tsx */
export const Button: React.FC<{
  variant?: ButtonVariant;
  size?: "default" | "sm" | "lg";
  scale?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ variant = "default", size = "default", scale = 1, style, children }) => {
  const h = size === "lg" ? 56 : size === "sm" ? 40 : 44;
  const px = size === "lg" ? 28 : size === "sm" ? 16 : 20;
  const look: Record<ButtonVariant, React.CSSProperties> = {
    default: { background: color.primary, color: color.primaryFg },
    outline: { border: `2px solid ${color.primary}`, color: color.foreground },
    ghost: { background: color.card, color: color.foreground },
    secondary: { background: color.secondary, color: color.foreground },
  };
  return (
    <div
      style={{
        height: h,
        padding: `0 ${px}px`,
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: font.body,
        fontSize: size === "lg" ? 18 : size === "sm" ? 14 : 16,
        fontWeight: 600,
        whiteSpace: "nowrap",
        flexShrink: 0,
        transform: `scale(${scale})`,
        ...look[variant],
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** A finger tap: a dot that lands and a ring that spreads, at screen coordinates. */
export const Tap: React.FC<{ frame: number; at: number; x: number; y: number }> = ({ frame, at, x, y }) => {
  const t = frame - at;
  if (t < -4 || t > 16) return null;
  const dot = interpolate(t, [-4, 0, 6, 12], [0, 1, 1, 0], clamp);
  const ring = interpolate(t, [0, 14], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 100, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: -22,
          top: -22,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: "rgba(43,20,71,0.35)",
          border: "3px solid rgba(255,255,255,0.9)",
          opacity: dot,
          transform: `scale(${0.6 + dot * 0.4})`,
        }}
      />
      {t >= 0 && (
        <div
          style={{
            position: "absolute",
            left: -40,
            top: -40,
            width: 80,
            height: 80,
            borderRadius: 40,
            border: `4px solid ${color.primary}`,
            opacity: 1 - ring,
            transform: `scale(${0.4 + ring})`,
          }}
        />
      )}
    </div>
  );
};

/** The page padding the app uses on phones (container px-4). */
export const PAGE_X = 16;
export const PAGE_W = SCREEN_W - PAGE_X * 2;

/** A scrolling page area under the status bar, offset by `scroll` px. */
export const Page: React.FC<{ scroll?: number; top?: number; children: React.ReactNode }> = ({
  scroll = 0,
  top = 40,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top,
      width: SCREEN_W,
      padding: `0 ${PAGE_X}px`,
      transform: `translateY(${-scroll}px)`,
      fontFamily: font.body,
      color: color.foreground,
    }}
  >
    {children}
  </div>
);
