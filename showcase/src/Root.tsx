import React from "react";
import { Composition } from "remotion";
import { evenBeats } from "./beats";
import { FPS, REPO, SHOWCASE_FRAMES, Showcase } from "./Showcase";
import { COOK_SHOT_BEATS, CookShot } from "./shots/CookShot";
import { DEVICES_SHOT_BEATS, DevicesShot } from "./shots/DevicesShot";
import { IMPORT_SHOT_BEATS, ImportShot } from "./shots/ImportShot";
import { LIBRARY_SHOT_BEATS, LibraryShot } from "./shots/LibraryShot";
import { SCALE_SHOT_BEATS, ScaleShot } from "./shots/ScaleShot";
import { TitleCard } from "./shots/TitleShot";

const SIZE = { fps: FPS, width: 1920, height: 1080 } as const;
/** A shot rendered on its own runs on evenly spaced beats at the song's tempo. */
const beatsLong = (n: number) => evenBeats(FPS)[n];

export const Root: React.FC = () => (
  <>
    <Composition id="Showcase" component={Showcase} durationInFrames={SHOWCASE_FRAMES} {...SIZE} />
    <Composition id="LibraryShot" component={LibraryShot} durationInFrames={beatsLong(LIBRARY_SHOT_BEATS)} {...SIZE} />
    <Composition id="ScaleShot" component={ScaleShot} durationInFrames={beatsLong(SCALE_SHOT_BEATS)} {...SIZE} />
    <Composition id="CookShot" component={CookShot} durationInFrames={beatsLong(COOK_SHOT_BEATS)} {...SIZE} />
    <Composition id="DevicesShot" component={DevicesShot} durationInFrames={beatsLong(DEVICES_SHOT_BEATS)} {...SIZE} />
    <Composition id="ImportShot" component={ImportShot} durationInFrames={beatsLong(IMPORT_SHOT_BEATS)} {...SIZE} />
    <Composition
      id="EndCard"
      component={TitleCard}
      durationInFrames={beatsLong(8)}
      defaultProps={{ at: [0, beatsLong(1), beatsLong(2)] as [number, number, number], footer: REPO }}
      {...SIZE}
    />
  </>
);
