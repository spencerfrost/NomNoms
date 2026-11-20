import { Lock } from "lucide-react";
import React from "react";
import { color, font } from "../theme";

/**
 * A device that morphs between phone, tablet and laptop. Screen sizes are in
 * CSS pixels (what the app lays out against); `stageScale` is how big that
 * screen is drawn on the 1920×1080 stage.
 */
export interface DeviceShape {
  w: number;
  h: number;
  stageScale: number;
  bezel: number;
  radius: number;
  screenRadius: number;
  /** 0 = no laptop base, 1 = full keyboard deck. */
  base: number;
}

export const PHONE: DeviceShape = { w: 390, h: 844, stageScale: 1.1, bezel: 14, radius: 64, screenRadius: 50, base: 0 };
export const TABLET: DeviceShape = { w: 768, h: 1024, stageScale: 0.86, bezel: 24, radius: 44, screenRadius: 22, base: 0 };
export const LAPTOP: DeviceShape = { w: 1280, h: 800, stageScale: 0.68, bezel: 18, radius: 22, screenRadius: 6, base: 1 };

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const mixShape = (a: DeviceShape, b: DeviceShape, t: number): DeviceShape => ({
  w: mix(a.w, b.w, t),
  h: mix(a.h, b.h, t),
  stageScale: mix(a.stageScale, b.stageScale, t),
  bezel: mix(a.bezel, b.bezel, t),
  radius: mix(a.radius, b.radius, t),
  screenRadius: mix(a.screenRadius, b.screenRadius, t),
  base: mix(a.base, b.base, t),
});

/** The device, centred at (cx, cy) on the stage; children lay out in its screen's CSS pixels. */
export const Device: React.FC<{ shape: DeviceShape; cx: number; cy: number; children: React.ReactNode }> = ({
  shape,
  cx,
  cy,
  children,
}) => {
  const { w, h, stageScale, bezel, radius, screenRadius, base } = shape;
  const outerW = w + bezel * 2;
  const outerH = h + bezel * 2;
  // The laptop sits a little higher so its deck fits under it.
  const lift = base * 40;
  return (
    <div
      style={{
        position: "absolute",
        left: cx - outerW / 2,
        top: cy - outerH / 2 - lift / stageScale,
        width: outerW,
        height: outerH,
        transform: `scale(${stageScale})`,
        transformOrigin: "center",
      }}
    >
      <div
        style={{
          width: outerW,
          height: outerH,
          borderRadius: radius,
          background: "#1b1022",
          padding: bezel,
          boxShadow: ["0 0 0 2px #3a2a4a", "0 50px 90px rgba(43,20,71,0.3)"].join(", "),
        }}
      >
        <div
          style={{
            position: "relative",
            width: w,
            height: h,
            borderRadius: screenRadius,
            overflow: "hidden",
            background: color.background,
            fontFamily: font.body,
            color: color.foreground,
          }}
        >
          {children}
        </div>
      </div>
      {base > 0.01 && (
        // The keyboard deck: a wide, thin slab with a notch, under the screen.
        <div
          style={{
            position: "absolute",
            left: -outerW * 0.07 * base,
            right: -outerW * 0.07 * base,
            top: outerH - 2,
            height: 34 * base,
            borderRadius: "4px 4px 26px 26px",
            background: "linear-gradient(#cfc6dc, #a99dbb)",
            opacity: base,
            boxShadow: "0 30px 50px rgba(43,20,71,0.3)",
          }}
        >
          <div style={{ margin: "0 auto", width: 220, height: 12, borderRadius: "0 0 12px 12px", background: "#9a8fae" }} />
        </div>
      )}
    </div>
  );
};

/** A plain browser toolbar for the laptop: tab and address bar. */
export const BrowserChrome: React.FC<{ title: string; path: string; opacity?: number }> = ({ title, path, opacity = 1 }) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 76, background: "#e9e4f2", opacity, zIndex: 60, fontFamily: font.body }}>
    <div style={{ display: "flex", alignItems: "flex-end", height: 36, padding: "0 14px", gap: 8 }}>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, marginBottom: 10 }} />
      ))}
      <div style={{ marginLeft: 14, height: 30, width: 260, borderRadius: "10px 10px 0 0", background: color.background, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 13, fontWeight: 500, color: color.foreground, whiteSpace: "nowrap", overflow: "hidden" }}>
        {title}
      </div>
    </div>
    <div style={{ height: 40, background: color.background, display: "flex", alignItems: "center", padding: "0 14px" }}>
      <div style={{ flex: 1, height: 28, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", gap: 8, padding: "0 14px", fontSize: 13, color: "#555" }}>
        <Lock size={12} />
        {path}
      </div>
    </div>
  </div>
);
