# Elements & isotopes

Buildless, browser-local chemistry explorer created with AI assistance. `periodic-explorer` owns selection, keyboard navigation and the detail panel; `electron-shells` renders a schematic counting diagram. `model.mjs` isolates geometry, configuration expansion, lookup and formatting from the DOM. No framework, backend, account, or runtime third-party API.

## Layout and interaction

At viewport widths of at least 1,200 CSS pixels, all 118 elements appear in a continuous 32-column table. Smaller widths use an 18-column layout with the 15-member lanthanide and actinide series inset. This convention does not settle group-3 classification. On phones the table scrolls horizontally to preserve usable 42-pixel-wide targets; search offers direct access without panning. Details stack vertically. Selecting on mobile moves focus to the detail heading.

Each element is a native button with a spoken name, number, category and pressed state. The table has one roving tab stop: left/right follows atomic number, up/down chooses the nearest column in the next occupied visual row, Home/End goes to hydrogen/oganesson, and Enter/Space selects. Categories have text labels as well as color. `?element=Cu` deep-links to an element. Default: carbon.

Electron diagrams show shell populations, not classical trajectories or orbital shapes. Expanded subshells are grouped by principal shell, not energy. Configuration exceptions are taken from source data, not inferred from an Aufbau filling rule.

## Data provenance

Retrieved 2026-11-24:

- PubChem periodic-table JSON: https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON
- IAEA LiveChart ground states: https://nds.iaea.org/relnsd/v0/data?fields=ground_states&nuclides=all
- API field conventions and underlying ENSDF/AME/NUBASE evaluations: https://nds.iaea.org/relnsd/vcharthtml/api_v0_guide.html
- Lawrencium configuration correction from NIST: https://physics.nist.gov/cgi-bin/Elements/elInfo.pl?context=frames&element=103

The nuclear source contains 3,386 rows, including the neutron. Its own extraction date is 2023-10-18; the UI states that clearly. Nuclear evaluation publication cutoffs are retained per selected nuclide. The snapshot includes 328 ground-state nuclides: all positive-abundance rows, selected familiar radioactive examples, and a radioactive example for remaining elements (chosen by greatest supplied numerical half-life in this ground-state dataset). These are examples, not a claim of natural abundance or a complete set of longest-lived states. No metastable states are included. Missing values remain null, never zero.

Binding is supplied in keV per nucleon and divided by 1,000 for display in MeV per nucleon. Atomic masses in the internal data are in micro-u and are used only for independent unit checks. Original binding uncertainties and mass-systematics flags are retained. Displayed energies are rounded to four decimal places. Half-life operators, units, and uncertainty strings are preserved. Abundance uncertainties are displayed as percentage points.

IAEA data is acknowledged under its educational/informational terms; this independent presentation does not imply endorsement. Source URLs, download SHA-256 hashes, retrieval date and extraction dates are included in `data.json`. The source values are a dated educational reference, not a live evaluated-data service. PubChem predicted/calculated qualifiers are retained; its older Lr 6d configuration is replaced by NIST's 7p assignment with an explicit provenance field and visible note.

Cross-sections are explained and linked to NNDC, not reduced to unqualified element constants. An energy-dependent reaction browser is a future increment.

To reproduce the local transformation after separately downloading/reviewing the two official source files:

```sh
python3 projects/periodic-table/import-data.py /path/pubchem.json /path/iaea.csv
```

Review source dates and update the documented retrieval date before a future refresh.

## Verification

```sh
node projects/periodic-table/check.mjs
node --check projects/periodic-table/app.mjs
python3 scripts/check-site.py
```

Data/model checks validate all electron totals and subshell capacities, distinct nuclides, isotope arithmetic, abundance bounds, both table layouts and their lack of collisions, exceptional configurations (Cu, Pd, Lr), search/default behavior, preserved half-life qualifiers and missing values. An independent atomic-mass-defect calculation for C, Fe and U checks the binding-energy scale and units. These are automated checks, not a fresh evaluation of the underlying scientific data.

Browser checks: 1440 px continuous layout (32 columns, no page overflow); 390 px inset layout, mobile focus movement and shell diagram; 320 px no page overflow; carbon-14 half-life/abundance selection, copper exception, lawrencium correction, arrow-key navigation and Enter selection, failed search feedback, and no recorded console errors. These are focused browser checks, not an exhaustive device audit.
