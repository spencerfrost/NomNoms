import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { BeatFrames, beatFramesFrom, BEATS } from "./beats";
import { COOK_SHOT_BEATS, CookShot } from "./shots/CookShot";
import { DEVICES_SHOT_BEATS, DevicesShot } from "./shots/DevicesShot";
import { IMPORT_SHOT_BEATS, ImportShot } from "./shots/ImportShot";
import { LIBRARY_SHOT_BEATS, LibraryShot } from "./shots/LibraryShot";
import { SCALE_SHOT_BEATS, ScaleShot } from "./shots/ScaleShot";
import { TitleCard } from "./shots/TitleShot";

export const FPS = 30;

/** "Regulate" by Dyalla (royalty-free), in public/audio/ (not committed). */
const SOUNDTRACK = "regulate.mp3";
export const REPO = "github.com/spencerfrost/NomNoms";

/**
 * A short walkthrough of the daily drivers, on the song's beat grid
 * (data/beats.json). It starts on the intro's last hit before the band
 * (7.15 s) with the title card; step 1 starts on the band's entry (beat 13).
 * The five steps run back to back. After step 5 the song is edited: it jumps
 * from beat 49 to beat 137 (both the second bar of a 4-bar phrase) so the
 * end card gets the song's last bars and its final hit.
 */
const SONG_START = 7.15;
const FIRST_STEP_BEAT = 13;
const CUT_FROM_BEAT = 49;
const CUT_TO_BEAT = 137;
const END_BEATS = 8;
/** The song's final hit, in beats from the end card's start. */
const FINAL_HIT = 5;

type ShotComponent = React.FC<{ beats?: BeatFrames }>;
const STEPS: [string, ShotComponent, number][] = [
  ["1 library", LibraryShot, LIBRARY_SHOT_BEATS],
  ["2 scale", ScaleShot, SCALE_SHOT_BEATS],
  ["3 cook", CookShot, COOK_SHOT_BEATS],
  ["4 devices", DevicesShot, DEVICES_SHOT_BEATS],
  ["5 import", ImportShot, IMPORT_SHOT_BEATS],
];

const atBeat = (beat: number) => Math.round((BEATS[beat] - SONG_START) * FPS);
const firstBeats = STEPS.reduce<number[]>((acc, [, , len], i) => [...acc, i === 0 ? FIRST_STEP_BEAT : acc[i - 1] + STEPS[i - 1][2]], []);
const lastStepEnd = firstBeats[firstBeats.length - 1] + STEPS[STEPS.length - 1][2];
if (lastStepEnd !== CUT_FROM_BEAT) {
  throw new Error(`The steps end on beat ${lastStepEnd}, not on the edit's beat ${CUT_FROM_BEAT}`);
}

export const CUT_FRAME = atBeat(CUT_FROM_BEAT);
const afterCut = (beat: number) => CUT_FRAME + Math.round((BEATS[beat] - BEATS[CUT_TO_BEAT]) * FPS);
export const SHOWCASE_FRAMES = afterCut(CUT_TO_BEAT + END_BEATS);
const TITLE_FRAMES = atBeat(FIRST_STEP_BEAT);

/** A few frames of crossfade at the edit, so the jump in the waveform doesn't click. */
const XFADE = 3;
/**
 * The audio edit sits this many frames before the visual cut. The beat grid runs ~45 ms late on both
 * downbeats (hits at ~31.44 s and ~87.61 s), so the crossfade has to finish before the hit: the outgoing
 * phrase is silent when its hit lands and the incoming hit plays at full volume.
 */
const AUDIO_EARLY = 2;
const AUDIO_CUT = CUT_FRAME - AUDIO_EARLY;
const END_AUDIO_FROM = AUDIO_CUT - XFADE;
const clampAll = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const songVolume = (f: number) => interpolate(f, [END_AUDIO_FROM, AUDIO_CUT], [1, 0], clampAll);
/** The end's audio: in over the crossfade, out over the last two beats, after the final hit. */
const endFadeFrom = afterCut(CUT_TO_BEAT + END_BEATS - 2) - END_AUDIO_FROM;
const endVolume = (f: number) =>
  interpolate(f, [0, XFADE], [0, 1], clampAll) * interpolate(f, [endFadeFrom, SHOWCASE_FRAMES - END_AUDIO_FROM], [1, 0], clampAll);

export const Showcase: React.FC = () => {
  const endBeats = beatFramesFrom(CUT_TO_BEAT, CUT_FRAME, BEATS[CUT_TO_BEAT] - CUT_FRAME / FPS, FPS);
  return (
    <AbsoluteFill>
      <Sequence name="song" durationInFrames={AUDIO_CUT + 1}>
        <Audio src={staticFile(`audio/${SOUNDTRACK}`)} trimBefore={Math.round(SONG_START * FPS)} volume={songVolume} />
      </Sequence>
      <Sequence name="song end" from={END_AUDIO_FROM}>
        <Audio
          src={staticFile(`audio/${SOUNDTRACK}`)}
          trimBefore={Math.round(BEATS[CUT_TO_BEAT] * FPS) - (CUT_FRAME - END_AUDIO_FROM)}
          volume={endVolume}
        />
      </Sequence>
      <Sequence name="title" durationInFrames={TITLE_FRAMES}>
        <TitleCard at={[0, 4, 12]} zoomOut={TITLE_FRAMES - 6} />
      </Sequence>
      {STEPS.map(([id, Shot, length], k) => {
        const from = atBeat(firstBeats[k]);
        const to = atBeat(firstBeats[k] + length);
        return (
          <Sequence key={id} name={id} from={from} durationInFrames={to - from}>
            <Shot beats={beatFramesFrom(firstBeats[k], from, SONG_START, FPS)} />
          </Sequence>
        );
      })}
      <Sequence name="end" from={CUT_FRAME} durationInFrames={SHOWCASE_FRAMES - CUT_FRAME}>
        <TitleCard at={[endBeats[0], endBeats[1], endBeats[2]]} bounce={endBeats[FINAL_HIT]} footer={REPO} />
      </Sequence>
    </AbsoluteFill>
  );
};
