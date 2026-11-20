import React from "react";
import { color, font } from "../theme";

/** The phone's screen in CSS pixels (an iPhone-sized 390×844), so app classes keep their real sizes. */
export const SCREEN_W = 390;
export const SCREEN_H = 844;
const BEZEL = 14;
export const PHONE_W = SCREEN_W + BEZEL * 2;
export const PHONE_H = SCREEN_H + BEZEL * 2;

/** Where the phone usually sits: right of centre, leaving the left for headlines. */
export const PHONE_HOME = { cx: 1290, cy: 540, scale: 1.1 };

interface PhoneProps {
  /** Stage position of the phone's centre. */
  cx?: number;
  cy?: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
  /** Screen background; the app's page colour by default. */
  screen?: string;
  children: React.ReactNode;
}

/** A plain phone frame, positioned by its centre on the 1920×1080 stage. */
export const Phone: React.FC<PhoneProps> = ({
  cx = PHONE_HOME.cx,
  cy = PHONE_HOME.cy,
  scale = PHONE_HOME.scale,
  rotate = 0,
  opacity = 1,
  screen = color.background,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: cx - PHONE_W / 2,
      top: cy - PHONE_H / 2,
      width: PHONE_W,
      height: PHONE_H,
      transform: `scale(${scale}) rotate(${rotate}deg)`,
      opacity,
      borderRadius: 64,
      background: "#1b1022",
      padding: BEZEL,
      boxShadow: ["0 0 0 2px #3a2a4a", "0 50px 90px rgba(43,20,71,0.35)", "0 18px 30px rgba(43,20,71,0.25)"].join(", "),
    }}
  >
    <div
      style={{
        position: "relative",
        width: SCREEN_W,
        height: SCREEN_H,
        borderRadius: 50,
        overflow: "hidden",
        background: screen,
        fontFamily: font.body,
        color: color.foreground,
      }}
    >
      {children}
      {/* Camera hole */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: SCREEN_W / 2 - 9,
          width: 18,
          height: 18,
          borderRadius: 9,
          background: "#000",
        }}
      />
    </div>
  </div>
);

/** The status bar: time and battery, drawn small and plain. */
export const StatusBar: React.FC<{ dark?: boolean; bg?: string }> = ({ dark, bg }) => {
  const ink = dark ? "#fff" : color.foreground;
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px",
        fontSize: 15,
        fontWeight: 600,
        color: ink,
        background: bg ?? (dark ? "transparent" : color.background),
        zIndex: 60,
      }}
    >
      <span>9:41</span>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
          {[5, 8, 11, 14].map((h) => (
            <span key={h} style={{ width: 3, height: h, borderRadius: 1, background: ink }} />
          ))}
        </span>
        <span
          style={{
            width: 24,
            height: 12,
            borderRadius: 3,
            border: `1.5px solid ${ink}`,
            padding: 1.5,
            display: "flex",
          }}
        >
          <span style={{ flex: 1, borderRadius: 1, background: ink }} />
        </span>
      </span>
    </div>
  );
};
