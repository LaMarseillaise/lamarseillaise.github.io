# Calendars & clocks

Andur Carr's timekeeping exploration. Plain JavaScript, native Web Components and SVG; no build, packages, network APIs, accounts, analytics or stored birthdays. Implementation and prose developed with AI assistance. Original alternative-system rules were supplied and confirmed by Andur, not inferred from historical standards.

## Run and verify

Serve the repository root and open `/projects/calendars-and-clocks/`.

```sh
node projects/calendars-and-clocks/check.mjs
python3 scripts/check-site.py
```

The first command invokes the independent Python standard-library oracle, so both Node and Python 3 are needed for developer checks, not for visitors.

## Components

`app.mjs` loads four individually registered, self-contained elements in `/components/timekeeping/`: `clock-comparison`, `timezone-experiment`, `seasonal-calendar`, and `doomsday-walkthrough`. Each has its own Shadow DOM, controls, state and listener lifecycle. The clock releases its timer when disconnected. Instance state does not live in globals or local storage. Shared style and UTC-label helpers live in `common.js`; arithmetic is in the DOM-independent `model.mjs`.

Readout labels and sources remain in static HTML if JavaScript is unavailable. Live clocks do not announce every tick. Walkthrough steps are hidden until revealed, including the answer; entering a new date resets them. Practice mode uses a random Gregorian date with days 1–28, so it is practice sampling rather than a uniform distribution across every date.

## Alternative-system specification

- Hexadecimal day: 65,536 equal ticks, `0000`–`FFFF`, 1.318359375 seconds each. The sole global boundary is 12:00 UTC, corresponding to midnight at the geometric dateline. The conventional timezone selector never changes the hexadecimal clock or seasonal date. Browser/Unix days are treated as 86,400 seconds; no leap-second display or true-solar-time measurement.
- Four 91-day seasons, each thirteen seven-day weeks. Season labels I–IV, day labels 1–7. Annual Year Day after Season IV; Leap Day after Season II in leap years. Both extra days have null season, week and weekday. They do not advance this calendar's seven-day cycle.
- Leap rule applies to the displayed year: 4, except 100, restore 400, except 4000. In particular, 12000 is common, 12024 leap, 12100 common, 12400 leap, 14000 leap. Mean length 365.24225 days; no promise of permanent astronomical alignment.
- Epoch: 12000 / I / week 1 / day 1 at `1999-12-22T12:00:00Z`. The previous global day contains the December 1999 solstice (tabulated around 07:44 UTC on December 22) and is 11999's closing intercalary day. The year number resembles Gregorian +10,000 for most of a modern year; it increments near December's solstice, not January 1.
- Supported seasonal years 10001–19999 are arithmetic extrapolations. Conversion is anchored in 1999, not in a fabricated observed ancient solstice. Exact early-era history is not reconstructed.
- Equal arithmetic quarters are deliberately not annually recomputed astronomical seasons. Historical Revolutionary-calendar conventions remain separate; the existing Revolutionary project is linked, not modified.

## Conventional time and dates

- Clocks use the device's time. Named-zone display uses the browser's `Intl` timezone data, whose version can differ across devices. An instant inspector accepts explicitly UTC input to avoid ambiguous or nonexistent local-time parsing. The decimal readout subdivides selected local civil clock labels and therefore follows their DST jumps/repeats; it is not a monotonic elapsed-duration clock.
- The DST instrument uses fixed 2026 Los Angeles examples around March 8, 10:00 UTC and November 1, 09:00 UTC. It does not promise future government rules.
- Doomsday accepts Gregorian dates 0001–9999, validates leap days and month lengths, and uses a date-only calculation without timezone conversion. It is proleptic Gregorian before adoption, not a regional historical converter.
- Century anchors: 1600s Tuesday, 1700s Sunday, 1800s Friday, 1900s Wednesday; repeat every 400 years. During implementation review, the earlier planning outline's swapped 1800/1900 labels were corrected before publication.
- Historical jumps are described with their jurisdiction and calendars; the continuous weekday cycle survives each jump. The October Revolution date pair is a Julian/Gregorian label difference. No generic “missing date” validator is applied to the proleptic calculator.

## Sources checked 23 November 2026

- [U.S. Naval Observatory: calendars](https://aa.usno.navy.mil/faq/calendars) — Julian and Gregorian rules, seasonal drift and Easter motivation.
- [IANA timezone database](https://www.iana.org/time-zones) — named zones and political changes.
- [NIST daylight saving rules](https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst) — U.S. rules and 2026 dates.
- [Calendar (New Style) Act 1750](https://www.legislation.gov.uk/apgb/Geo2/24/23) — Britain and its colonies; web reader did not render XHTML, corroborated with the archival letter annotation and Folger below.
- [Folger Shakespeare Library: untangling dating](https://www.folger.edu/blogs/collation/untangling-dating/) — 1582 and 1752 transitions, January versus Lady Day year numbering.
- [Franklin, Poor Richard Improved, 1752](https://founders.archives.gov/documents/Franklin/01-04-02-0082) — directly inspected original text in National Archives transcription. The published short quotation comes from its closing prefatory wish for a happy New Year. We did not use its outdated astronomical assertions as scientific evidence.
- [Franklin to Edward and Jane Mecom, 14 September 1752](https://founders.archives.gov/documents/Franklin/01-04-02-0132) — contemporary New Style date and scholarly annotation about the preceding September 2. The widely circulated old-man/sleeping joke was not verified in these original texts and is not quoted as established fact.
- [Warwick Modern Records Centre: Britain and the Russian Civil War](https://warwick.ac.uk/services/library/mrc/collections/digital/russia/civil_war/) — October 25 / November 7, 1917.
- [NIST: Doomsday Rule](https://xlinux.nist.gov/dads/HTML/doomsday.html) and [month-anchor explanation](https://www.timeanddate.com/date/doomsday-rule.html).
- The epoch's astronomical reference is documented in the [design record](../../docs/calendars-and-clocks-plan.md), including retrieval limitations. The user explicitly selected the solstice-containing day and the following global midnight as the calendar's anchor.

## Verification

Checks passed on 23 November 2026. `oracle.py` constructs explicit seasonal week/day sequences and intercalations; it does not use the JavaScript closed-form year-start formula. The resulting digest is compared against every JavaScript conversion record across years 12000–15999, including inverse conversion and the last millisecond of each day. Doomsday is compared against native UTC date weekdays for a complete independent Gregorian cycle.


- All 1,460,969 days in displayed years 12000–15999 matched the independent Python oracle, with 4,000 Year Days and 969 Leap Days. Inverse conversion and each day’s final millisecond passed; epoch, range and invalid-input cases also passed.
- All 146,097 dates in the Gregorian cycle 1600–1999 matched native UTC weekdays, with additional early-year, century, leap-day and invalid-date cases.
- All 131,072 hexadecimal tick boundaries across two test days passed, including negative Unix timestamps. Four before/after daylight-saving offset checks passed.
- Browser smoke checks covered the epoch’s FFFF→0000 rollover, timezone-independent global displays, spring skipped and autumn repeated hours, Leap Day→Season III, Year Day limits, keyboard step reveal and answer reset. Separate component instances stayed independent after disconnect/reconnect; reconnect did not duplicate step handlers.
- Layout inspected at desktop, 375 px and 320 px widths; no horizontal page overflow at 320 px and no captured browser errors. This is not a complete accessibility or cross-browser audit.
