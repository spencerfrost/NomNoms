# Recipe import corpus

Saved recipe pages and their correct parse, used to measure `parseRecipeHtml`
(`lib/recipe-import-utils.ts`). Run `pnpm probe:import` (add `--lines` for each wrong line).

- `pages/*.html`: real pages fetched 2026-11-16 and trimmed (scripts other than JSON-LD,
  styles, SVGs, nav/header/footer and comment sections removed). Two `synthetic-*` pages are
  hand-written to cover the microdata and plain-HTML fallbacks, which real sites rarely reach.
- `expected.json`: per page, the true step count and each ingredient line's correct amount and
  canonical unit. `"*"` accepts any unit (count words like "rashers" or "1 (15-ounce) can").
  Ranges are flagged `"range"` and expect the low value; the probe also checks that the high value came out in `amountMax` (`rangesWithHighEnd`).
- `probe.ts`: compares the importer's output with `expected.json`. Ingredient lines are
  matched by position, so a page that returns a different number of ingredients counts every
  line as wrong.

Jest ignores this folder (`testPathIgnorePatterns`); tests that use the corpus live in
`__tests__/lib/`.

To add a page: save its HTML, trim it the same way (keep `<script type="application/ld+json">`
and the recipe markup), and add an entry to `expected.json` written from the page itself, not
from the importer's output.
