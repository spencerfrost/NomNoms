import React from "react";
import { AbsoluteFill } from "remotion";
import { color } from "../theme";

/**
 * The stage behind every shot: the app's lilac ground with soft candy-tile
 * blobs. `pulse` (0–1) swells the blobs on a beat; `tint` swaps the ground
 * for a flash colour.
 */
export const Backdrop: React.FC<{ pulse?: number; tint?: string; drift?: number }> = ({
  pulse = 0,
  tint = color.background,
  drift = 0,
}) => {
  const blobs: [string, number, number, number][] = [
    [color.mango, 220, 180, 520],
    [color.pink, 1700, 140, 460],
    [color.mint, 1560, 960, 560],
    [color.sky, 300, 980, 480],
  ];
  return (
    <AbsoluteFill style={{ background: tint, overflow: "hidden" }}>
      {blobs.map(([c, x, y, r], i) => {
        const size = r * (1 + pulse * 0.08);
        const dx = Math.sin(drift / 40 + i * 1.7) * 30;
        const dy = Math.cos(drift / 50 + i) * 24;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - size / 2 + dx,
              top: y - size / 2 + dy,
              width: size,
              height: size,
              borderRadius: "50%",
              background: c,
              opacity: 0.45,
              filter: "blur(70px)",
            }}
          />
        );
      })}
      {/* Dot grid, like a recipe card's texture */}
      <AbsoluteFill
        style={{
          opacity: 0.35,
          backgroundImage: `radial-gradient(${color.border} 2px, transparent 2px)`,
          backgroundSize: "36px 36px",
        }}
      />
    </AbsoluteFill>
  );
};
