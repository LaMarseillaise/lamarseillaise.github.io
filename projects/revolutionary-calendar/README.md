# Revolutionary calendar & clock

A buildless, plain-JavaScript adaptation of my calendar projects. Serve the
repository over HTTP and visit `/projects/revolutionary-calendar/`. No account, backend,
external fonts, runtime libraries, or paid services are required.

## Provenance and conventions

Adapted with AI assistance from my Ruby calendar in
[RegimeWeb](https://github.com/LaMarseillaise/RegimeWeb) (source inspected at
`5395b9506d15f27b6ff2413fa34a200370d010bb`) and the subsequent
[JavaScript translation](https://github.com/LaMarseillaise/revolutionary)
(`ac8085baa10530e506f8ef9f61774947bd6a5f4f`). Neither source repository was changed.

- Corrects their epoch from September 21 to **September 22, 1792**, matching
  Article I of the [calendar decree](https://fr.wikisource.org/wiki/D%C3%A9cret_de_la_Convention_nationale_portant_sur_la_cr%C3%A9ation_du_calendrier_r%C3%A9publicain).
- Retains the original arithmetic leap rule: years congruent to 3 modulo 4,
  except years congruent to 99 modulo 100 unless also 399 modulo 400. This is an
  extrapolation, not an astronomical calculation or an official modern calendar.
- Twelve 30-day months, followed by five or six complementary days. Month 13
  is an internal representation of those festival days, not a historical month.
- Paris is the default location. Date and clock both use the selected modern
  civil zone through `Intl.DateTimeFormat`, including daylight-saving changes.
  A decimal day subdivides the local 24-hour reading into 100,000 seconds; it
  does not stretch to measure elapsed time through a 23- or 25-hour day.
- Fresh device time on every update avoids accumulated timer drift. Pause is
  a display convenience, not a change to the underlying clock. No time service
  is contacted; accuracy depends on the visitor's device clock.
- History and explanatory sources are linked on the page (consulted 2026-11-22).

## Checks

```sh
node projects/revolutionary-calendar/check.mjs
```

Checks seven historical anchors, every date in a 400-year arithmetic cycle,
invalid dates and leap festival days, all ordinary seconds of a day, Roman
numerals, and Paris daylight-saving/date boundaries. These verify the declared
arithmetic convention, not the astronomical equinox. Browser checks should
also cover the moving dial, pause/resume, location selection, mobile layout,
keyboard focus, and current-day highlight.

The unique URL avoids shadowing by the separate `revolutionary` repository's
potential GitHub Pages route.
