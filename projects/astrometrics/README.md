# Astrometrics

A browser observatory about finding new facts through observation and reasoning. Conceived by Andur Carr and implemented with AI assistance. The opening childhood story is his recollection, including the remembered Pokémon attribution; it is not an independently verified episode citation.

## Run and check

Serve the repository root with an ordinary static HTTP server and open `/projects/astrometrics/`. No build, package installation, account, API, or backend is required. `app.mjs` connects the controls to the independent calculation functions in `model.mjs`. Diagrams are inline SVG; prose and source links remain available without JavaScript.

```sh
node projects/astrometrics/check.mjs
node --check projects/astrometrics/app.mjs
python3 scripts/render-sky-diagrams.py
```

## Models and limits

- **Two supplied facts:** circumference = light speed / circuits per second. Uses the remembered 186,000 miles/second and adjustable circuit count. This is a deduction from rounded inputs, not an independent measurement or a claim that light curves around Earth.
- **Eratosthenes:** angle = atan(shadow / stick height); circumference = site separation × 360° / angle. Assumes a spherical Earth, sites on one meridian, parallel sunlight, and the Sun overhead at the first site. The 800 km / 12.6 cm defaults are illustrative modern inputs, not a reconstruction of exact ancient records. Globe angles are enlarged 2.5 times; stick and shadow share a scale.
- **Metric history:** the original meter proposal used a quarter of the Paris meridian. It did not use the equatorial circumference. Modern SI fixes the meter through light speed and the second, so Earth's size no longer defines it.
- **Solar scale:** an inner planet's 224.7-day period compared with Earth's 365.25 days yields an orbital-radius ratio through Kepler's third law. Round-trip radar gives a gap `c × time / 2`; dividing that by `1 − radius ratio` gives the ideal Earth–Sun distance. Assumes circular, aligned, coplanar orbits and negligible motion during the echo. The values are hypothetical observations; real planetary radar needs specialized equipment and a more complete orbital model. Light speed is supplied independently.
- **Stellar parallax:** a two-au baseline gives a full shift of 2p; p is the half-angle paired with one au. The exact right triangle gives `d = au / tan(p)`. At small angles the conventional parsec relation is `d(pc) = 1 / p(arcseconds)`. The screen diagram compresses depth qualitatively; its drawn angle is not a scale measurement. Real observations must also fit stellar motion and measurement error.
- **Conversion:** uses fixed au = 149,597,870.7 km, c = 299,792.458 km/s, a Julian year of 365.25 × 86,400 seconds, and pc = 648,000/π au. Outputs are rounded. Experiment sliders do not change these definitions. Converter inputs must be finite, nonnegative, and no larger than 10¹⁸.
- **Seasons:** four fixed-axis Earths with a 23.44° obliquity and one orthographic camera, projected from a circular orbit. Gold equators are calculated in the plane normal to the axis; rear segments are dashed. Daylight is the projection of the sunward hemisphere. Orbital locators share the camera. This is explanatory geometry, not an ephemeris. Temperature lag is explained qualitatively, not predicted for a location.
- **Moon phases:** eight orbital positions from above Earth's north pole, counterclockwise, with sunlight from the left. Corresponding Earth-view discs use illuminated fraction `(1 − cos(elongation)) / 2`, lunar north up. The orbit view suppresses the roughly 5° inclination; this simplification must not imply monthly eclipses. Real apparent orientation varies.
- **Eclipses:** side-view alignment diagrams show central umbras only; sizes, distances and shadow widths are schematic. The lunar viewpoint's red rim and ground are illustrations, not a photometric simulation. “Terran eclipse” is Andur's preferred descriptive label for a solar eclipse by Earth seen from the Moon, not a claim of standard nomenclature.

`scripts/render-sky-diagrams.py` regenerates the 16 original SVG assets in `diagrams/` using only Python's standard library. They are committed assets and require no build or JavaScript to view. The existing interactive calculator code is unchanged by this extension.

## Sources

Consulted 23 November 2026. These support the explanations and constants; the adjustable examples are our own simplified models.

- [NOAA: history of geodesy and Eratosthenes](https://oceanservice.noaa.gov/education/tutorial_geodesy/geo02_hist.html)
- [NIST: the meter and its history](https://www.nist.gov/si-redefinition/meter)
- [University of Nebraska–Lincoln: radar ranging](https://astro.unl.edu/naap/distance/radar.html)
- [NASA: orbits and Kepler's laws](https://science.nasa.gov/solar-system/orbits-and-keplers-laws/)
- [NASA/JPL: astronomical unit](https://cneos.jpl.nasa.gov/glossary/au.html)
- [University of Nebraska–Lincoln: parallax](https://astro.unl.edu/naap/distance/parallax.html)
- [Particle Data Group: astrophysical constants and units, 2024](https://pdg.lbl.gov/2024/reviews/rpp2024-rev-astrophysical-constants.pdf)
- [NASA: Earth facts and seasons](https://science.nasa.gov/earth/facts/)
- [NASA: Moon phases](https://science.nasa.gov/moon/moon-phases/)
- [National Weather Service: seasons and seasonal temperature lag](https://www.weather.gov/cle/seasons)
- [NASA: eclipse geometry](https://science.nasa.gov/eclipses/geometry/)
- [NASA: types of eclipses](https://science.nasa.gov/eclipses/types/)
- [NASA: lunar eclipses and atmospheric filtering](https://science.nasa.gov/moon/eclipses/)
- [NASA: eclipses observed from space and the Moon](https://www.nasa.gov/history/eclipses-near-and-far/)
- [NASA: visual appearance of lunar eclipses](https://eclipse.gsfc.nasa.gov/LEcat5/appearance.html)
- [NASA: solar eclipse viewing safety](https://science.nasa.gov/eclipses/safety/)

## Validation performed

23 November 2026:

- Calculation checks passed: independently known 45° and 7.2° shadow cases, round-trip radar and orbital-ratio anchors, constants, 80 conversion round trips, all 40 parallax settings, and invalid inputs.
- JavaScript syntax check passed.
- Browser checks covered slider updates and resets, parallax transfer to the converter, zero/negative/empty conversion inputs, unit changes, and keyboard opening of the geometry disclosure. No browser warning or error logs were captured during these checks.
- Inspected desktop and 375 px layouts, and checked the page at 320 px for horizontal overflow (none). This is a responsive smoke check, not a complete browser or assistive-technology audit.

Potential later additions: adjustable seasons and lunar-phase geometry, measured observation entry, and a more detailed angular diagram. The related [calendars-and-clocks project outline](../../docs/calendars-and-clocks-plan.md) records the proposed timekeeping project and unresolved alternative-calendar definitions.

### Seasons, phases and eclipses extension — 23 November 2026

- Re-ran the existing calculation checks and JavaScript syntax check successfully.
- Parsed all 16 generated SVGs as XML and verified accessible titles. Measured the eight phase paths' areas against the analytic illuminated fractions (within 0.2 percentage points); checked the quarter phases' left/right orientation. Regeneration produced identical file hashes.
- The site checker passed 23 HTML pages and 358 local links/assets/fragments, including legacy routes and deterministic content rendering. `git diff --check` passed.
- Visually inspected seasons, phases and eclipse sections at desktop and 375 px; checked eclipse labels and absence of page overflow at 320 px. Confirmed new images loaded when scrolled into view, and keyboard activation of the Seasons link. No browser warning/error logs were captured. This is a responsive smoke check, not a full accessibility or cross-browser audit.
- Independently checked the planning document's 23 November 2026 Doomsday example with Python's date implementation: Monday. The future calendar project itself is not yet implemented.
