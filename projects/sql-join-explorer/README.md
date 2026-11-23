# SQL Join Explorer

A small interactive lesson about row multiplication, aggregation, and event identity. Built with AI assistance; all records are synthetic. This is a teaching artifact, not an account of production work or a financial reporting system.

## Run locally

From the repository root, with Python 3 installed:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/sql-join-explorer/ . JavaScript modules require HTTP serving; opening the HTML directly is not supported. No API, account, or paid service is needed.

## Check the results

With Python 3 and Node.js installed, from the repository root:

```sh
python3 projects/sql-join-explorer/check.py
```

The check extracts the exact three queries displayed in the HTML and executes them in an in-memory SQLite database. It compares their results to the JavaScript model for all 12 control combinations (36 totals), compares every intermediate joined row, and checks a separate arithmetic oracle. Two hand-calculated counterexamples and seven invalid-input rejections are also checked. It requires no third-party packages or network access.

The default one-payment/two-refund case produces $17 after the join versus the correct $7. With two equal $10 payments, DISTINCT incorrectly leaves $7, while the correct total is $17. Equal values are not necessarily duplicate events.

## Design and limits

- `model.mjs` holds the pure calculation; `demo.mjs` renders the controls and tables.
- The browser illustrates SQL in JavaScript; it does not run an arbitrary SQL engine.
- Signed events combined with UNION ALL preserve each payment and refund once. Pre-aggregating each side is another valid approach outside this lesson's scope.
- One account, posted events, valid IDs and parent relationships, and integer cents are assumed. Reporting windows, currencies, ingestion deduplication, and complete accounting are excluded.
- The checker establishes these examples' numerical behavior. It does not establish production readiness, accessibility conformance, or compatibility with every SQL dialect.
