import assert from 'node:assert/strict';
import { cleanMarkup, cleanGrammar, describeMarkup } from './grammar.mjs';

// Older readings have no grammar property. Loading one must add no invented analysis.
assert.deepEqual(cleanGrammar(undefined, ['Ipse', 'enim']), {});
// Corrupt or stale token indices and punctuation must not acquire annotations.
const stored = JSON.parse('{"0":{"case":"accusative","number":"singular","uncertain":true},"1":{"case":"nominative"},"2":{"tense":"perfect","note":"  alternative  "},"3":{"case":"dative"},"01":{"case":"genitive"},"__proto__":{"case":"ablative"}}');
const before = JSON.stringify(stored);
assert.deepEqual(cleanGrammar(stored, ['word', ':', 'other']), {
  0: { case: 'accusative', number: 'singular', uncertain: true },
  2: { tense: 'perfect', note: 'alternative' },
});
assert.equal(JSON.stringify(stored), before);
assert.deepEqual(cleanMarkup({ case: 'made-up', person: 3, uncertain: 'true', note: {}, extra: 'discard' }), {});
assert.deepEqual(cleanMarkup({ note: '<img src=x onerror=alert(1)>' }), { note: '<img src=x onerror=alert(1)>' }); // Render only as text.
assert.equal(describeMarkup({ case: 'accusative', number: 'singular', gender: 'masculine', uncertain: true }, true), 'acc. · sg. · m. · ?');
assert.equal(describeMarkup({ person: '3', number: 'plural', tense: 'perfect', mood: 'indicative', voice: 'active' }), 'Person: Third; Number: Plural; Tense: Perfect; Mood / infinitive: Indicative; Voice (form): Active');
// Partial, note-only and uncertain-only readings are valid; no role or link is inferred.
assert.deepEqual(cleanMarkup({ uncertain: true }), { uncertain: true });
assert.deepEqual(cleanMarkup({ note: 'genitive or dative?' }), { note: 'genitive or dative?' });
assert.deepEqual(cleanMarkup({ case: 'accusative', role: 'object' }), { case: 'accusative' });
console.log('Grammar validation, old-reading compatibility, partial analyses, and badge checks passed.');
