// Public-domain Latin, checked against the linked editions on November 22, 2026.
// No English translations or pre-solved grammatical annotations are supplied.
export const passages = [
  {
    id: 'cicero-friendship-80', title: 'Cicero · Laelius de amicitia §80',
    source: 'https://www.thelatinlibrary.com/cicero/amic.shtml#80',
    text: 'Ipse enim se quisque diligit, non ut aliquam a se ipse mercedem exigat caritatis suae, sed quod per se sibi quisque carus est.',
    note: 'An excerpt from the discussion of friendship you remembered. The text follows The Latin Library; punctuation is retained.',
  },
  {
    id: 'cicero-alter-idem-80', title: 'Cicero · The end of §80',
    source: 'https://www.thelatinlibrary.com/cicero/amic.shtml#80',
    text: 'Quod nisi idem in amicitiam transferetur, verus amicus numquam reperietur; est enim is qui est tamquam alter idem.',
    note: 'The following sentence from the same passage. Read it with the preceding excerpt for context.',
  },
  {
    id: 'genesis-1-27', title: 'Vulgata · Genesis 1:27',
    source: 'https://www.drbo.org/lvb/chapter/01001.htm',
    text: 'Et creavit Deus hominem ad imaginem suam : ad imaginem Dei creavit illum, masculum et feminam creavit eos.',
    note: 'The Latin text follows the edition at DRBO. This workspace leaves both translation and interpretation to the reader.',
  },
];

export const relations = {
  reference: { label: 'Same referent', color: '#6a429b', note: 'Two expressions that refer to the same person or thing.' },
  agreement: { label: 'Agreement', color: '#986000', note: 'For example, a noun and an agreeing adjective or demonstrative. Select the noun first.' },
  subject: { label: 'Subject → verb', color: '#006c79', note: 'Select the subject first, then its verb.' },
  object: { label: 'Verb → object', color: '#a23547', note: 'Select the verb first, then its object.' },
};

export function tokens(passage) { return passage.text.split(/\s+/); }
export function validConnection(link, count) {
  return link && Number.isInteger(link.from) && Number.isInteger(link.to) &&
    link.from >= 0 && link.to >= 0 && link.from < count && link.to < count &&
    link.from !== link.to && Object.hasOwn(relations, link.type);
}
export function connectionKey(link) {
  const ends = ['reference', 'agreement'].includes(link.type)
    ? [link.from, link.to].sort((a, b) => a - b) : [link.from, link.to];
  return [link.type, ...ends].join(':');
}
