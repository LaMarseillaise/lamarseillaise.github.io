# Accessibility review — 24 November 2026

The site has a good accessibility foundation, but this is a preliminary engineering review, not a WCAG conformance claim. Automated checks cannot establish that a game, diagram, custom component, or complete workflow is usable with assistive technology.

## Scope and evidence

- axe-core 4.14.1 was downloaded from npm and run locally; no audit dependency or testing UI ships on the site.
- Thirteen representative routes: home, project directory, one Musings article, and all ten projects. Initial scans used a 685 × 989 CSS-pixel viewport. This covers representative templates, not every article, legacy redirect, game state, browser, or assistive technology.
- Additional 320-pixel viewport scans and reflow observations: home, Mastermind, periodic table, Latin, Astrometrics, Calendars & Clocks, and calculator. No page-level horizontal overflow on these seven routes. The carousel and calendar comparison table intentionally scroll inside their own regions. This is viewport testing, not an actual browser-zoom or text-only enlargement test.
- Keyboard checks: the home skip link focuses main; carousel End moves to projects 9–10 of 10 after smooth scrolling; calculator keyboard input 7 + 8 and Enter produces 15. Mastermind was also scanned after a submitted guess, rather than only its empty board.
- Most initial scans reported no automatic violations. Three rules produced actionable findings across three projects; these were fixed and the affected views rescanned. Several pages still return “incomplete / needs review,” especially contrast over SVGs, backgrounds and textures. These are unresolved manual checks, not passes.
- Three Card Monte has pre-existing, uncommitted changes in the working tree (including a heading, main landmark and navigation). Its local scan included those changes. They are preserved and are not included in this publication. The deployed version therefore still needs those structural improvements reviewed and published; the local scan must not be treated as evidence that the deployed page has them.

## Small fixes included with the favicon update

1. **Mastermind semantics:** the secret-code container and dynamically generated feedback groups now have a valid group role for their accessible labels. The latter issue appeared only after submitting a guess. The entry module URL is versioned so returning visitors receive the corrected code.
2. **Periodic-table reference link:** the standalone PubChem link has a larger hit area and separation from the subshell disclosure. The prior 685-pixel layout failed the target-size check. The corrected stylesheet is versioned.
3. **Three Card Monte contrast:** white Shuffle text on `#3498db` measured 3.15:1. The new `#1e6697` gives approximately 6.17:1, and its `#1a5782` hover state approximately 7.69:1. Only these color changes and favicon references are staged from that file; unrelated local changes remain pending.

## Existing strengths

- Semantic headings/landmarks and skip links across the main site and newer projects; native links and buttons, accessible names for icon controls, and visible keyboard-focus styling.
- Carousel has manual controls and keyboard navigation, without autoplay. Its scrolling honors reduced-motion preference in source.
- Mastermind numbers its colored pegs and supplies text feedback. Latin connections also have textual descriptions and selectable word buttons; they are not communicated solely through colored lines.
- The calculator uses native keys with accessible operator names. Calendar components can pause/inspect time; continuously changing clock readouts use `aria-live="off"` rather than announcing every tick.
- Astrometrics provides diagram titles, image descriptions, captions and explanatory prose. The periodic table provides shell-count text alongside the graphic, labeled isotopes and searchable element names.
- Main-site body text (`#16313d`) and muted text (`#425f6b`) on `#eefaff` calculate to approximately 12.82:1 and 6.41:1 respectively. These calculations do not establish contrast for every rendered combination.

## Priorities for the next pass

1. **Real screen-reader workflows.** Test VoiceOver/Safari and NVDA/Firefox or Chrome through the carousel, Latin annotation creation/deletion, gallery open/close, both Mastermind roles, calculator results and calendar controls. Check focus restoration and live-region verbosity after each action. No screen reader was exercised in this review.
2. **Small controls and reading size.** The fitted periodic table deliberately has narrow phone tiles and small labels. Search and Larger tiles provide alternatives; preserve the compact overview the user requested. A labeled list/combobox of all 118 elements would make the alternative more discoverable and avoid requiring advance knowledge of a name. Keep commonly used controls comfortably large; do not claim that fitting the screen alone makes a dense table accessible.
3. **Manual visual checks.** Complete contrast review of wood-textured Mastermind labels, SVG text, Latin relationship colors and focus rings. Check forced-colors/high-contrast mode, 200% text enlargement, 400% browser zoom, and reduced motion in operation. Small fixed text can remain hard to read even when a contrast checker passes.
4. **Three Card Monte structure and motion.** Review/publish the existing heading/main/navigation work separately. Verify reduced-motion behavior and assess what meaningful nonvisual play would require for a game whose mechanic is tracking moving cards. Native buttons alone do not make that mechanic equivalent for a blind player.
5. **Repeatable checks.** Add an opt-in development/CI accessibility audit with representative interactive states and a manual checklist. Keep axe out of production. Add regression cases for issues actually found rather than treating a zero-violation result as a completion certificate.

## Reference criteria

- [WCAG 2.2 contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): normally 4.5:1 for text and 3:1 for qualifying large text.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): 24 × 24 CSS pixels or applicable spacing/equivalent-control exceptions. 44 × 44 is a useful more generous target for primary controls.
- [WCAG 2.2 reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): ordinary content should reflow at 320 CSS pixels, with exceptions for content whose meaning requires two-dimensional layout, such as data tables and diagrams.

The practical next milestone is a verified keyboard and screen-reader path through each project, supported by visual and automated checks, rather than an accessibility score.
