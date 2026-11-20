import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { clamp, pop, snap } from "../motion";
import { color, font } from "../theme";

/**
 * The opening card and the closing one: the logo mark, the name and one plain
 * line about what it is. `beats` places the icon (0), the name (1) and the
 * line (2); `bounce` is a frame for a bump on a hit (the song's last one, at
 * the end); `zoomOut` is the frame the card starts zooming through into the next shot.
 */
export const TitleCard: React.FC<{
  at: [number, number, number];
  bounce?: number;
  zoomOut?: number;
  footer?: string;
}> = ({ at, bounce, zoomOut, footer }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const icon = pop(frame, at[0], fps, 260);
  const name = interpolate(frame, [at[1], at[1] + 6], [0, 1], { ...clamp, easing: snap });
  const line = interpolate(frame, [at[2], at[2] + 8], [0, 1], { ...clamp, easing: snap });
  const bump = bounce === undefined ? 1 : interpolate(frame - bounce, [0, 3, 12], [1, 1.1, 1], clamp);
  const through = zoomOut === undefined ? 0 : interpolate(frame, [zoomOut, zoomOut + 6], [0, 1], { ...clamp, easing: snap });

  return (
    <AbsoluteFill>
      <Backdrop drift={frame + 100} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${1 + through * 2})`, opacity: 1 - through }}>
        <Img
          src={staticFile("images/logo-mark.svg")}
          style={{
            width: 190,
            height: 190,
            filter: "drop-shadow(0 30px 30px rgba(43,20,71,0.18))",
            transform: `scale(${icon * bump}) rotate(${(1 - icon) * -16}deg)`,
          }}
        />
        <div
          style={{
            marginTop: 22,
            fontFamily: font.display,
            fontSize: 130,
            lineHeight: 1,
            color: color.foreground,
            opacity: frame >= at[1] ? Math.min(1, name * 2) : 0,
            transform: `translateY(${(1 - name) * 30}px)`,
          }}
        >
          NomNoms
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: font.body,
            fontWeight: 600,
            fontSize: 40,
            color: color.mutedFg,
            opacity: line,
            transform: `translateY(${(1 - line) * 16}px)`,
          }}
        >
          Your recipes, on all your devices.
        </div>
        {footer && (
          <div style={{ marginTop: 34, fontFamily: font.body, fontWeight: 600, fontSize: 30, color: color.mutedFg, opacity: line }}>{footer}</div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
