# Calendars & clocks — project outline

Status: implemented and verified for publication, 23 November 2026. This brief records the design decisions; release status and checks are tracked in the project README. Route: `/projects/calendars-and-clocks/`.

## The central question

What does nature give us, and what do we choose? Rotation, lunar phases and the seasonal year give us cycles that do not divide neatly into one another. Calendars, clock faces and time zones are agreements for labeling those cycles.

Use the visual language of an instrument cabinet: one live instant, several ways to read it. Link to Astrometrics for the geometry and the Revolutionary Calendar for the existing decimal-time experiment. Preserve the site's buildless HTML, CSS, plain JavaScript and small native Web Components.

## A sequence to explore

1. **One instant, many clocks.** Start with the current instant in UTC and a selectable IANA time zone. Show 12-hour, 24-hour, existing revolutionary decimal time, and the proposed hexadecimal alternative together. A draggable timeline should freeze all displays to the same instant. Explain that a new display does not make time pass differently.
2. **Sun time versus civil time.** Show longitude and local solar noon before introducing time zones. Distinguish a geographic zone and its changing rules from a fixed UTC offset. Let a user compare the same instant in several places and see that the date can differ.
3. **The missing hour and the repeated hour.** Walk through a spring DST jump and an autumn repeated hour in a named zone and year. Keep UTC visible and monotonic. A repeated local label refers to two instants; a skipped label refers to none. Avoid suggesting all places use DST or the same transition dates. Offer accessible step buttons as well as a timeline.
4. **A year refuses to fit.** Explain why a calendar year needs leap-day rules. Compare Julian and Gregorian accumulated drift against the seasonal year. Gregorian rules: divisible by 4, except centuries unless divisible by 400. Explain the historical connection to the equinox and the computation of Easter; distinguish the calendar's improved approximation from exact astronomy.
5. **The dates people skipped.** A timeline must distinguish elapsed days from labels. Introduce the October 1582 transition in early adopting countries, then Britain and its colonies in September 1752. Adoption was regional, not a worldwide overnight change. Explain the October Revolution's 25 October 1917 Julian / 7 November Gregorian date pair. Verify each regional transition against historical sources before implementing a conversion mode. A proleptic Gregorian date is a modern extension of a rule, not necessarily the label a person used then. Do not confuse the Julian calendar with astronomical Julian Day numbers.
6. **Alternative agreements.** Present Andur's hexadecimal clock and seasonal calendar alongside existing conventions, using the confirmed definitions below and clearly distinguishing proposed remaining conventions. The seasonal calendar should link back to the distinction between astronomical seasons and delayed temperatures.
7. **Conway's Doomsday Rule.** Enter a date and reveal one mental step at a time; offer a practice mode with answers initially hidden. Connect the explanation to Andur's habit of working out someone's birthday weekday in conversation. No birthday storage or external transmission.

## Doomsday walkthrough specification

Start with the Gregorian calendar and label that assumption. Use weekday indices Sunday=0 through Saturday=6 internally, but write weekday names in the interface.

1. Find the century anchor: Tuesday for 2000–2099 (Friday for 1800–1899; Wednesday for 1900–1999; Sunday for 2100–2199).
2. Take the last two digits of the year. Divide by 12: retain the quotient and remainder.
3. Add the quotient, the remainder, and the number of whole fours in the remainder.
4. Advance that many weekdays from the century anchor, wrapping every seven. This is the year's doomsday.
5. Pick a memorable doomsday in the chosen month: 4/4, 6/6, 8/8, 10/10, 12/12; 5/9 and 9/5; 7/11 and 11/7; March 14; the last day of February. January 3 in common years, January 4 in leap years.
6. Count forward or backward to the target date. Show both the actual day difference and its remainder modulo seven.

Worked example for 23 November 2026: 26 = 2×12 + 2; 2 + 2 + floor(2/4) = 4; Tuesday + 4 = Saturday. November 7 is Saturday. November 23 is 16 days later; 16 mod 7 = 2, so Monday. The walkthrough should show the reasoning, not just this answer.

Before release, check every date in a full 400-year Gregorian cycle against an independent date implementation. Include 1900 and 2100 (not leap years), 2000 (leap), January/February, negative weekday offsets, invalid dates, and timezone-independent date-only handling. Keep historical regional calendars outside the initial calculator; offer an explicit Gregorian/proleptic explanation rather than silently converting.

## Alternative systems — supplied by Andur, 23 November 2026

These definitions supersede the earlier note that the specifications were missing. They come directly from the user, not from inferred conversation history.

### Hexadecimal clock

- User specifies the standard four-digit hexadecimal clock, with no time zones or daylight saving adjustments. `0000` is midnight at the International Date Line.
- Implement the four digits as a fraction of one fixed 24-hour day: `0000` through `FFFF`, with 65,536 equal ticks. One tick is exactly 86,400 / 65,536 = 1.318359375 ordinary seconds. This is the mathematical interpretation of the supplied four-digit clock, not a claim that a universal civil standard exists.
- Interpret the dateline reference geometrically at 180° longitude: midnight there corresponds to 12:00 UTC. Political bends in the date line do not define a unique local timezone. The clock itself has one global reading, independent of the viewer's timezone and DST. UTC is an implementation reference, not a user-selectable adjustment to this clock.
- For the browser's ordinary Unix-millisecond timeline: `dayFraction = positiveModulo(timestampMs + 43_200_000, 86_400_000) / 86_400_000`; display `floor(dayFraction * 65_536)` as four uppercase hexadecimal digits. Positive modulo matters for dates before the Unix epoch.
- Anchors: 12:00 UTC → `0000`; 18:00 UTC → `4000`; 00:00 UTC → `8000`; 06:00 UTC → `C000`. Selecting a conventional timezone must not change this reading.
- State that this browser model treats a day as 86,400 seconds and does not display leap seconds. Resolve any future leap-second policy separately; do not imply the device measures true solar midnight.

### Seasonal calendar

Confirmed by the user:

- Four seasons, each containing thirteen seven-day weeks: 91 days per season, 364 ordinary days per year.
- One annual intercalary day near the northern December/winter solstice, plus another near the northern June/summer solstice in leap years. Thus 365 days normally and 366 in leap years.
- The year begins on the approximate first full day of northern winter. This is an arithmetic seasonal calendar; the user explicitly says approximate, not an annually recalculated astronomical boundary.
- An abstract 10,000 BC basis, with the current year written by prefixing a `1`: 2026 corresponds to 12026. Treat this as the intended modern numbering relation; do not claim an observed astronomical epoch in antiquity.
- Leap years use the **displayed seasonal year**, explicitly confirmed in follow-up: divisible by 4; exclude multiples of 100; restore multiples of 400; exclude multiples of 4000.
- Predicate: `Y % 4 === 0 && (Y % 100 !== 0 || Y % 400 === 0) && Y % 4000 !== 0`.
- This produces 969 leap years per 4,000-year cycle and a mean year of 365.24225 days. It is a proposed arithmetic convention, not the Gregorian leap rule or a promise of perpetual astronomical precision.
- Applying the rule to `Y`, not `Y − 10000`, is essential: 12000 is common although CE 2000 is Gregorian leap; 14000 is leap although CE 4000 would fail a CE-based 4000-year exception. Year 12024 is leap, 12026 common, 12100 common and 12400 leap.
- Season names are not remembered; prefer names that do not privilege the northern hemisphere.
- **Epoch anchor, confirmed in the next user message:** the day containing the Gregorian December 1999 solstice is the annual intercalary day and the last day of seasonal year 11999. Year 12000 starts with the following full day. This supersedes the earlier suggested 2025 anchor as the defining reference.

Derived implementation anchor, aligning calendar days with the global hexadecimal clock:

- The December 1999 solstice is tabulated at approximately **22 December 1999, 07:44 UTC**. The indexed *Astronomical Data, 1999* table gives December 22 at 07:44; separate ephemeris listings agree to the minute. The USNO API could not be retrieved in this check, and the archived PDF exceeded the web reader's size limit; no successful direct API verification is claimed. Second-level precision is unnecessary for identifying the day.
- The hexadecimal day containing that instant runs from **21 December 1999, 12:00 UTC**, inclusive, to **22 December 1999, 12:00 UTC**, exclusive. That whole day is the final intercalary day of **11999**.
- **Season I, week 1, day 1 of 12000 begins at 22 December 1999, 12:00 UTC (`0000`).** This is the next midnight at the geometric dateline, approximately 4 hours 16 minutes after the solstice. It is not midnight UTC and not the solstice instant itself.
- Use that exact UTC timestamp as the computational anchor; deriving seasonal labels from day offsets makes a separate UTC+12/UTC−12 civil-date convention unnecessary. Any Gregorian date shown alongside it must name its timezone.
- Year 12000 has 365 days under the confirmed displayed-year rule. Consequently 12001 begins at 21 December 2000, 12:00 UTC. Counting forward gives 12026 beginning 21 December 2025, 12:00 UTC, its closing intercalary day beginning 20 December 2026, 12:00 UTC, and 12027 beginning 21 December 2026, 12:00 UTC.
- Establish this anchor once, then count using the calendar's own year lengths. Do not reset annually to a Gregorian date or a freshly observed solstice; equal arithmetic seasons only approximate the astronomical events.

Conventions **confirmed by the user before implementation**:

- Use the confirmed neutral labels **Season I, Season II, Season III, Season IV** initially. Give the approximate December–March, March–June, June–September and September–December correspondence in explanatory text, rather than naming them Winter/Spring/Summer/Autumn globally.
- The annual extra day is at the end of the year; the leap extra day falls after Season II and before Season III. Both extra days are outside the week count. In that design the named weekdays restart consistently in each season, while the uninterrupted Gregorian weekday cycle diverges across an extra day. Explain this rather than silently calling them the same weekday system.
- Keep ancient conversions outside the initial supported range until year-zero/BCE numbering and the abstract epoch are explicitly specified. The modern +10,000 relation alone does not settle every ancient boundary.

### Earlier implementation plan (now completed)

The definitions now support the hexadecimal clock and anchored calendar year arithmetic. Build conventional-clock comparison, the fixed global hexadecimal display, and the Doomsday component first. Use the 1999 anchor above and the now-confirmed extra-day placements and weekday treatment. Equal 91-day quarters only approximate astronomical seasons, whose durations are unequal.

Verification recorded for these planning updates: derived the tick length, counted the 969 intercalations per 4,000 years, compared displayed-year versus CE-year leap cases, and checked day boundaries/year lengths with Python date arithmetic. After the 1999 anchor was supplied, counted forward independently to the starts of 12001, 12024, 12026 and 12027 and the closing intercalary day of 12026. Those planning checks preceded implementation. The complete page and exhaustive verification now live in `projects/calendars-and-clocks/`; see its README for results.

## Implementation boundaries

- Separate pure calendar/date arithmetic from presentation. Model a date-only value separately from an instant; avoid accidental UTC/local shifts from parsing a birthday as a timestamp.
- Components could be `clock-comparison`, `zone-timeline`, `calendar-transition`, and `doomsday-walkthrough`. Each owns only its controls and rendering; pure functions supply their shared calculations.
- Use browser `Intl` for displaying named zones; report the browser's installed timezone-data limitation. Do not claim to predict future legal changes. Validate ambiguous or nonexistent local-time input explicitly.
- Explain any astronomical approximation and supported year range; no hidden network calls or paid API dependency.
- No autoplay, no per-second live-region announcements, reduced-motion support, meaningful form labels, readable static explanations without JavaScript.
- Add to the homepage carousel and project directory only once there is a usable page.

## Research starting points

Consulted 23 November 2026:

- [U.S. Naval Observatory: introduction to calendars](https://aa.usno.navy.mil/faq/calendars) — astronomical cycles and Gregorian leap rules.
- [U.S. Naval Observatory: leap years](https://aa.usno.navy.mil/faq/leap_years).
- [Calendars chapter, Explanatory Supplement to the Astronomical Almanac](https://aa.usno.navy.mil/downloads/c15_usb_online.pdf) — detailed historical/calendar reference; inspect the relevant regional tables before implementing them.
- [NIST: Doomsday Rule](https://xlinux.nist.gov/dads/HTML/doomsday.html) — Conway attribution and further explanation.
- [Doomsday explanation and month anchors](https://www.timeanddate.com/date/doomsday-rule.html).
- [Astronomical Data, 1999 — archived government publication](https://www.govinfo.gov/content/pkg/GOVPUB-Y3_P19_2-ed9d45d1c4fa77270280583eb7629b18/pdf/GOVPUB-Y3_P19_2-ed9d45d1c4fa77270280583eb7629b18.pdf) — indexed table lists the December solstice on December 22 at 07:44; full PDF not inspected in this update.

Still to source in detail: the October Revolution date pair, exact regional skipped-date examples, and current timezone/DST behavior. Alternative-system definitions above were supplied and clarified directly by Andur on 23 November 2026. The proposed narrative remains an implementation brief, not a completed historical fact-check.
