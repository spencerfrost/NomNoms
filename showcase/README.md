# Showcase video

A short walkthrough of NomNoms' daily drivers, made with [Remotion](https://www.remotion.dev/) (React → MP4).
About 30 s, cut to the music, and readable with the sound off. The screens are redrawn from the app's
components and theme tokens ("Bite" in `app/globals.css`), not recorded from the app.

The only words on screen are the app's own UI text and a caption per step: a card in that step's colour
(mango, mint, pink, sky, grape, from the app's palette) with a plain header and one line saying what's on screen
(`src/components/StepCaption.tsx`).

This folder is its own pnpm project and workspace, separate from the app. `public/images` is a symlink to the
app's `public/images` (recipe photos and the logo mark; Remotion follows symlinked folders, not files).

```bash
pnpm install
pnpm studio          # scrub and edit in the browser
pnpm render          # full video → out/showcase.mp4
pnpm render:shot ScaleShot out/scale.mp4   # one shot, on evenly spaced beats
pnpm exec remotion still src/index.ts Showcase out/still.png --frame=540 --scale=0.5
```

## Shots

| Shot | File | Beats | What happens |
|---|---|---|---|
| Title | `src/shots/TitleShot.tsx` (`TitleCard`) | – | Logo mark, name, "Your recipes, on all your devices." |
| 1 Library | `src/shots/LibraryShot.tsx` | 8 | Pull back onto the home grid (header with the logo mark), search "chicken" (French onion soup matches by its stock), tap the curry |
| 2 Scale | `src/shots/ScaleShot.tsx` | 8 | Close-up on the ingredients: 2×, 3×, 2×; amounts and the yield roll over |
| 3 Cook | `src/shots/CookShot.tsx` | 8 | Start cooking, Next step on every beat through six steps, Done |
| 4 Devices | `src/shots/DevicesShot.tsx` | 6 | The recipe page as the phone morphs into a tablet and a laptop, reflowing at the app's breakpoints (`src/components/ResponsiveRecipe.tsx`) |
| 5 Import | `src/shots/ImportShot.tsx` | 6 | On the laptop: paste a link into Discover, Preview, the parsed recipe builds, Save, toast |
| End | `TitleCard` | 8 | Logo mark, name, the line and the repo link; a bump on the song's final hit |

`src/Showcase.tsx` puts them in order on the song's beat grid (`src/beats.ts`); each shot places its events on its
`beats` array (frames from its own start). The step lengths must add up to the edit's beat; `Showcase.tsx` throws
if they don't.

## Soundtrack

"Regulate" by Dyalla (royalty-free), about 94 bpm. It isn't committed (the licence covers use in the video, not
redistribution): put it at `public/audio/regulate.mp3` to render.

`src/data/beats.json` is its beat grid from librosa (`beat_track` with `start_bpm=94`; the default doubles it to
184). The 7 intro beats before 4.69 s and the beats after 90.84 s are extrapolated at the mean tempo.

| Beat | Song time | What's there | Used for |
|---|---|---|---|
| – | 7.15 s | The intro's last hit | Video start, title |
| 13 | 8.50 s | Full band comes in | Step 1 |
| 21, 29, 37, 43 | 13.6–27.7 s | Strong hits | Steps 2–5 |
| 49 | 31.49 s | Second bar of a phrase | Edit out |
| 137 | 87.66 s | Second bar of the outro's last phrase | Edit in, end card |
| 142 | 90.84 s | The song's final hit | End card's bump |

The edit has a 3-frame crossfade so the jump in the waveform doesn't click. The audio edit sits 2 frames before the
visual cut: the grid runs ~45 ms late on both downbeats, so the crossfade has to finish before the hit.

## Data

- `src/data/recipes.ts`: library tiles from the seed recipes in `data/recipes/*.json` (titles, yields, times,
  photos as stored). The hero curry's ingredients are written the way `lib/ingredient-parser.ts` reads a page,
  with names shortened to fit one line; its "2-3" chilis range was added to show ranges scaling. Amount
  formatting is a copy of `lib/amount-utils.ts`, the yield scaling of `RecipeHeader.tsx`.
- The import uses the seed Old Fashioned Cheesecake; its site (`sweet-tooth-diaries.com`) is made up.
- The laptop's address bar shows only the path, until the app has a public domain to show.
