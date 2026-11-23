# Astrometrics

A browser observatory about finding new facts through observation and reasoning. Conceived by Andur Carr and implemented with AI assistance. The opening childhood story is his recollection, including the remembered Pokémon attribution; it is not an independently verified episode citation.

## Run and check

Serve the repository root with an ordinary static HTTP server and open `/astrometrics/`. No build, package installation, account, API, or backend is required. `app.mjs` connects the controls to the independent calculation functions in `model.mjs`. Diagrams are inline SVG; prose and source links remain available without JavaScript.

```sh
node astrometrics/check.mjs
node --check astrometrics/app.mjs
```

## Models and limits

- **Two supplied facts:** circumference = light speed / circuits per second. Uses the remembered 186,000 miles/second and adjustable circuit count. This is a deduction from rounded inputs, not an independent measurement or a claim that light curves around Earth.
- **Eratosthenes:** angle = atan(shadow / stick height); circumference = site separation × 360° / angle. Assumes a spherical Earth, sites on one meridian, parallel sunlight, and the Sun overhead at the first site. The 800 km / 12.6 cm defaults are illustrative modern inputs, not a reconstruction of exact ancient records. Globe angles are enlarged 2.5 times; stick and shadow share a scale.
- **Metric history:** the original meter proposal used a quarter of the Paris meridian. It did not use the equatorial circumference. Modern SI fixes the meter through light speed and the second, so Earth's size no longer defines it.
- **Solar scale:** an inner planet's 224.7-day period compared with Earth's 365.25 days yields an orbital-radius ratio through Kepler's third law. Round-trip radar gives a gap `c × time / 2`; dividing that by `1 − radius ratio` gives the ideal Earth–Sun distance. Assumes circular, aligned, coplanar orbits and negligible motion during the echo. The values are hypothetical observations; real planetary radar needs specialized equipment and a more complete orbital model. Light speed is supplied independently.
- **Stellar parallax:** a two-au baseline gives a full shift of 2p; p is the half-angle paired with one au. The exact right triangle gives `d = au / tan(p)`. At small angles the conventional parsec relation is `d(pc) = 1 / p(arcseconds)`. The screen diagram compresses depth qualitatively; its drawn angle is not a scale measurement. Real observations must also fit stellar motion and measurement error.
- **Conversion:** uses fixed au = 149,597,870.7 km, c = 299,792.458 km/s, a Julian year of 365.25 × 86,400 seconds, and pc = 648,000/π au. Outputs are rounded. Experiment sliders do not change these definitions. Converter inputs must be finite, nonnegative, and no larger than 10¹⁸.

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

## Validation performed

23 November 2026:

- Calculation checks passed: independently known 45° and 7.2° shadow cases, round-trip radar and orbital-ratio anchors, constants, 80 conversion round trips, all 40 parallax settings, and invalid inputs.
- JavaScript syntax check passed.
- Browser checks covered slider updates and resets, parallax transfer to the converter, zero/negative/empty conversion inputs, unit changes, and keyboard opening of the geometry disclosure. No browser warning or error logs were captured during these checks.
- Inspected desktop and 375 px layouts, and checked the page at 320 px for horizontal overflow (none). This is a responsive smoke check, not a complete browser or assistive-technology audit.

Potential later additions: interactive seasons and lunar-phase geometry, measured observation entry, and a more detailed angular diagram. The current page includes short seasons and Moon explanations with links for further reading.
