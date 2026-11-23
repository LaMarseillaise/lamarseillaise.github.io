# Calendars & clocks — project outline

Status: proposed, 23 November 2026. This records the requested next project; it is not a finished page or an announcement of an implemented feature. Proposed route: `/projects/calendars-and-clocks/`.

## The central question

What does nature give us, and what do we choose? Rotation, lunar phases and the seasonal year give us cycles that do not divide neatly into one another. Calendars, clock faces and time zones are agreements for labeling those cycles.

Use the visual language of an instrument cabinet: one live instant, several ways to read it. Link to Astrometrics for the geometry and the Revolutionary Calendar for the existing decimal-time experiment. Preserve the site's buildless HTML, CSS, plain JavaScript and small native Web Components.

## A sequence to explore

1. **One instant, many clocks.** Start with the current instant in UTC and a selectable IANA time zone. Show 12-hour, 24-hour, existing revolutionary decimal time, and the proposed hexadecimal alternative together. A draggable timeline should freeze all displays to the same instant. Explain that a new display does not make time pass differently.
2. **Sun time versus civil time.** Show longitude and local solar noon before introducing time zones. Distinguish a geographic zone and its changing rules from a fixed UTC offset. Let a user compare the same instant in several places and see that the date can differ.
3. **The missing hour and the repeated hour.** Walk through a spring DST jump and an autumn repeated hour in a named zone and year. Keep UTC visible and monotonic. A repeated local label refers to two instants; a skipped label refers to none. Avoid suggesting all places use DST or the same transition dates. Offer accessible step buttons as well as a timeline.
4. **A year refuses to fit.** Explain why a calendar year needs leap-day rules. Compare Julian and Gregorian accumulated drift against the seasonal year. Gregorian rules: divisible by 4, except centuries unless divisible by 400. Explain the historical connection to the equinox and the computation of Easter; distinguish the calendar's improved approximation from exact astronomy.
5. **The dates people skipped.** A timeline must distinguish elapsed days from labels. Introduce the October 1582 transition in early adopting countries, then Britain and its colonies in September 1752. Adoption was regional, not a worldwide overnight change. Explain the October Revolution's 25 October 1917 Julian / 7 November Gregorian date pair. Verify each regional transition against historical sources before implementing a conversion mode. A proleptic Gregorian date is a modern extension of a rule, not necessarily the label a person used then. Do not confuse the Julian calendar with astronomical Julian Day numbers.
6. **Alternative agreements.** Present Andur's hexadecimal clock and seasonal calendar alongside existing conventions, with explicit rules and tradeoffs. Do not silently invent the missing definitions below. The seasonal calendar should link back to the distinction between astronomical seasons and delayed temperatures.
7. **Conway's Doomsday Rule.** Enter a date and reveal one mental step at a time; offer a practice mode with answers initially hidden. Connect the explanation to Andur's habit of working out someone's birthday weekday in conversation. No birthday storage or external transmission.

## Doomsday walkthrough specification

Start with the Gregorian calendar and label that assumption. Use weekday indices Sunday=0 through Saturday=6 internally, but write weekday names in the interface.

1. Find the century anchor: Tuesday for 2000–2099 (Wednesday for 1800–1899; Friday for 1900–1999; Sunday for 2100–2199).
2. Take the last two digits of the year. Divide by 12: retain the quotient and remainder.
3. Add the quotient, the remainder, and the number of whole fours in the remainder.
4. Advance that many weekdays from the century anchor, wrapping every seven. This is the year's doomsday.
5. Pick a memorable doomsday in the chosen month: 4/4, 6/6, 8/8, 10/10, 12/12; 5/9 and 9/5; 7/11 and 11/7; March 14; the last day of February. January 3 in common years, January 4 in leap years.
6. Count forward or backward to the target date. Show both the actual day difference and its remainder modulo seven.

Worked example for 23 November 2026: 26 = 2×12 + 2; 2 + 2 + floor(2/4) = 4; Tuesday + 4 = Saturday. November 7 is Saturday. November 23 is 16 days later; 16 mod 7 = 2, so Monday. The walkthrough should show the reasoning, not just this answer.

Before release, check every date in a full 400-year Gregorian cycle against an independent date implementation. Include 1900 and 2100 (not leap years), 2000 (leap), January/February, negative weekday offsets, invalid dates, and timezone-independent date-only handling. Keep historical regional calendars outside the initial calculator; offer an explicit Gregorian/proleptic explanation rather than silently converting.

## Definitions still needed from the earlier project

The referenced earlier hexadecimal-clock and seasonal-calendar specifications were not recovered in the available conversation-title search or filename search in the local GitHub directory. These remain open, not assumed:

- Hexadecimal clock: division of the day, digit grouping, precision, epoch/day boundary, and whether it represents elapsed fractions of a fixed 24-hour day or civil clock time through DST.
- Seasonal calendar: season boundaries (astronomical events or fixed arithmetic), hemisphere convention, month/week structure, year numbering, and leap/intercalary days.

These do not block the conventional-clock comparison, history, or Doomsday walkthrough. The first implementation increment should build those shared foundations and the Doomsday component; add the alternatives once their definitions are recovered or confirmed.

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

Still to source in detail: the October Revolution date pair, exact regional skipped-date examples, current timezone/DST behavior, and the original alternative-calendar definitions. The proposed narrative above is an implementation brief, not a completed historical fact-check.
