# Native site components

Import `/components/index.js` once on a collection page. No framework, runtime dependency, or build is needed. Shared colors inherit through CSS custom properties; component presentation lives in Shadow DOM. Content stays in slotted HTML, so titles and links are present before JavaScript runs and remain usable without it.

- `<project-card>` presents one project. Slots: `preview`, `category`, `heading`, `description`, `meta`, and `link`. It owns no navigation or collection state.
- `<project-carousel>` provides horizontal scroll snapping around arbitrary children. Previous/Next controls, native touch scrolling, and Left/Right/Home/End keys on the track are supported. It never rotates automatically or moves focus. Reduced-motion preferences suppress smooth scrolling. Its scroll/resize listeners are released when disconnected and restored on reconnection. Each instance has its own state.
- `<musing-card>` presents an article excerpt. Slots: `meta`, `heading`, `description`, `link`. The boolean `featured` attribute removes the list separator for the landing-page feature.
- `legacy-redirect.js` is a small routing script, independent of the components. Old project entry pages redirect to their canonical location and preserve query strings and fragments. Without JavaScript they show a direct link. GitHub Pages does not provide server-side redirect rules here; old asset/source-file URLs are not duplicated.

The full project directory uses the same cards as the carousel. `collections.css` supplies readable fallbacks for undefined elements. Article bodies and collection contents are static HTML; module failure does not hide them.

## Checks

`check.html` is a browser fixture for independent carousel instances, keyboard endpoints, style isolation, and disconnect/reconnect behavior. These checks passed on November 23, 2026. The landing page and article layout were also inspected at 375 px; the landing page had no horizontal overflow at 320 px. A preview with module scripts removed confirmed that all eight project links and their content remain available. A legacy Astrometrics URL preserved its query and `#stars` fragment. After relocation, the Mastermind worker returned and submitted a guess successfully, and the calendar and gallery loaded. This is a browser smoke check, not a complete accessibility or cross-browser audit.
