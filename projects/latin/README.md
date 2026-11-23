# Latin, connected

A buildless reading notebook, implemented with Codex. Users supply their own
translations and annotations; there are no supplied English translations, grammar
solutions, model calls, or claims of automatic parsing.

## Sources

Public-domain Latin excerpts checked November 22, 2026:

- Cicero, *Laelius de amicitia* §80: https://www.thelatinlibrary.com/cicero/amic.shtml
- Vulgata, Genesis 1:27, the edition at https://www.drbo.org/lvb/chapter/01001.htm
- Vulgata, III Regum 3:16–28 (modern 1 Kings), at
  https://www.drbo.org/lvb/chapter/11003.htm — the full episode in three
  consecutive excerpts (16–21, 22–25, 26–28), with separate drafts. Verse numbers
  are omitted; DRBO's unusual “meum autem vivit” in verse 22 is retained and
  identified in the source note rather than silently corrected.

`passages.mjs` holds text, source, and stable passage IDs. These editions' wording
and punctuation are retained. Token indices are zero-based whitespace positions;
punctuation-only tokens cannot be selected in the UI. If editing a passage's text,
change its ID to prevent old saved annotations attaching to the wrong words.

## Interaction and storage

Choose a relationship and select two words. Subject/verb and verb/object links
are directed; agreement and shared-reference links are non-directional. These
are separate categories: syntactic connection does not imply shared reference.
Repeated identical links are ignored. Hover or focus a connection's list row
to emphasize its endpoints; the textual list carries all information represented
by the SVG lines and colors. Hide connections for unassisted reading.

Translations, notes, links, and grammatical markup are saved per passage in `localStorage`, under
`andur-latin-readings-v1`. They are local to this origin/browser, not synced,
submitted, or published. An unavailable store produces a visible warning; JSON
export remains usable. Export is a backup/interchange artifact; this iteration
does not offer import or cross-tab merging. No English-word alignment or public
translation gallery is implemented yet. User prose is inserted using textContent
or textarea values, never interpreted as HTML.

Serve over HTTP and open `/projects/latin/`. `node projects/latin/check.mjs` validates passage IDs,
link endpoints/types, and directional duplicate handling. Browser checks should
exercise connecting/removing words, passage switches, reload persistence, hidden
links, export, wrapped-line geometry, and narrow viewports.

Verified November 22, 2026: data checks passed; in-app browser testing covered
connection creation/deletion, duplicate suppression, per-passage draft isolation,
reload persistence, hiding/showing links, and JSON export (downloaded contents
matched the draft and connection). Wrapped-line connectors were checked and
rerouted through the margin. At a 320-pixel frame width (305-pixel content area
after the scrollbar), no horizontal overflow occurred. The Latin page's captured
warning/error log was empty. Temporary test drafts and connections were cleared
through the UI. No actual translations were written. Storage-denial handling was
reviewed in code but not simulated in the browser; no cross-browser/device audit
or import round-trip is claimed.

## Manual grammatical markup

Choose **Mark grammar**, then a word. The modal editor accepts optional part of
speech/form, number, declension class, case, gender, degree, conjugation class,
person, tense, mood/infinitive, and morphological voice. Both field groups remain
available for forms such as participles. Uncertainty and free-form alternative
analyses are supported. Blank fields make no claims; no dictionary, automatic
analysis, or sentence-role inference is included. **Connect words** retains the
original two-word relationship workflow.

Saved tags appear as compact badges, with full labels in the word's accessible
name, tooltip, and editor. **Show grammar** hides badges without removing them.
Cancel/Escape discard pending edits; Save and Remove affect only that word.
Grammar is an additive `grammar` map keyed by the existing zero-based token index.
Old readings without this property remain readable; existing translations, notes,
and links are preserved. JSON exports now use version 2 and include this map.
Invalid field values, out-of-range indices, and punctuation annotations are
discarded on load. Notes are rendered as text, never HTML.

Checks: `node projects/latin/check.mjs`, `node projects/latin/grammar-check.mjs`, and
`node --check latin/latin.js`. Browser verification on November 22, 2026 covered
nominal and verbal tags, partial/uncertain analyses, preservation of drafts and
connections, reload persistence, passage isolation, hiding/showing tags,
Cancel/Escape, removal, focus return, and downloaded JSON contents. The editor
and page had no horizontal overflow at 320px; captured warnings/errors were empty.
Temporary test annotations and drafts were removed. No new cross-browser or
storage-denial simulation is claimed.

## Latin and transformers

The page explains the user's reported Latin/attention intuition while distinguishing
explicit grammatical and reference links from learned numerical attention weights.
The user's stand-up/Soviet Union anecdote illustrates contextual ambiguity;
it is not presented as evidence that attention weights explain interpretation.
Technical sources checked November 22, 2026:

- Vaswani et al., https://arxiv.org/html/1706.03762v7#S3.SS2
- Jain and Wallace, https://aclanthology.org/N19-1357/

Browser-assistance research (not integrated or benchmarked):

- Qwen3-1.7B ONNX is documented for Transformers.js:
  https://huggingface.co/onnx-community/Qwen3-1.7B-ONNX
- Browser inference with WASM/WebGPU:
  https://huggingface.co/docs/transformers.js/index
- LatinCy UDPipe provides Latin morphology/dependency analysis in a 72.3 MB model:
  https://huggingface.co/latincy/la_udpipe_latincy
  Its documented R/Python/CLI runtimes are not a verified browser drop-in. A WASM
  port or another browser-compatible export would need implementation/validation.

A future suggestion layer should be opt-in, load a pinned model only on request,
run in a worker, preserve manual annotations, validate token IDs and relation types,
and require accepting/rejecting each proposal. Dependency labels, morphology and
coreference need separate evaluation; fluent explanations and valid JSON do not
establish grammatical accuracy. Do not generate the user's translations.
