import assert from 'node:assert/strict';
import { passages, relations, tokens, validConnection, connectionKey } from './passages.mjs';
assert.equal(new Set(passages.map(p => p.id)).size, passages.length);
for (const passage of passages) {
  assert.match(passage.source, /^https:\/\//);
  assert.ok(tokens(passage).length > 1);
  for (const type of Object.keys(relations)) assert.ok(validConnection({ from: 0, to: 1, type }, tokens(passage).length));
  for (const link of [null, { from: -1, to: 1, type: 'reference' }, { from: 1, to: 1, type: 'subject' }, { from: 0, to: tokens(passage).length, type: 'object' }, { from: 0, to: 1, type: 'unknown' }]) assert.ok(!validConnection(link, tokens(passage).length));
}
assert.equal(connectionKey({ from: 1, to: 3, type: 'reference' }), connectionKey({ from: 3, to: 1, type: 'reference' }));
assert.notEqual(connectionKey({ from: 1, to: 3, type: 'subject' }), connectionKey({ from: 3, to: 1, type: 'subject' }));
console.log('Passage, endpoint validation, and directional-relationship checks passed.');
