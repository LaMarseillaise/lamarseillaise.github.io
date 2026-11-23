// Manual morphology only: these labels do not infer an analysis or a sentence role.
export const fields = {
  part: { label: 'Part of speech / form', group: 'general', options: [
    ['noun', 'Noun', 'n.'], ['adjective', 'Adjective', 'adj.'], ['pronoun', 'Pronoun', 'pron.'],
    ['verb', 'Verb', 'v.'], ['participle', 'Participle', 'ptcp.'], ['gerund', 'Gerund', 'ger.'],
    ['gerundive', 'Gerundive', 'gerundive'], ['supine', 'Supine', 'sup.'], ['adverb', 'Adverb', 'adv.'],
    ['preposition', 'Preposition', 'prep.'], ['conjunction', 'Conjunction', 'conj.'],
    ['numeral', 'Numeral', 'num.'], ['interjection', 'Interjection', 'interj.'], ['other', 'Other', 'other'],
  ] },
  declension: { label: 'Declension class', group: 'nominal', options: [
    ['1', 'First', 'decl. I'], ['2', 'Second', 'decl. II'], ['3', 'Third', 'decl. III'],
    ['4', 'Fourth', 'decl. IV'], ['5', 'Fifth', 'decl. V'], ['1-2', 'First and second', 'decl. I/II'],
    ['irregular', 'Irregular', 'irreg. decl.'], ['indeclinable', 'Indeclinable', 'indecl.'],
  ] },
  case: { label: 'Case', group: 'nominal', options: [
    ['nominative', 'Nominative', 'nom.'], ['genitive', 'Genitive', 'gen.'], ['dative', 'Dative', 'dat.'],
    ['accusative', 'Accusative', 'acc.'], ['ablative', 'Ablative', 'abl.'],
    ['vocative', 'Vocative', 'voc.'], ['locative', 'Locative', 'loc.'],
  ] },
  number: { label: 'Number', group: 'general', options: [['singular', 'Singular', 'sg.'], ['plural', 'Plural', 'pl.']] },
  gender: { label: 'Gender', group: 'nominal', options: [
    ['masculine', 'Masculine', 'm.'], ['feminine', 'Feminine', 'f.'], ['neuter', 'Neuter', 'n.'], ['common', 'Common', 'common'],
  ] },
  degree: { label: 'Degree', group: 'nominal', options: [
    ['positive', 'Positive', 'pos.'], ['comparative', 'Comparative', 'comp.'], ['superlative', 'Superlative', 'superl.'],
  ] },
  conjugation: { label: 'Conjugation class', group: 'verbal', options: [
    ['1', 'First', 'conj. I'], ['2', 'Second', 'conj. II'], ['3', 'Third', 'conj. III'],
    ['3-io', 'Third, -iō', 'conj. III-iō'], ['4', 'Fourth', 'conj. IV'], ['irregular', 'Irregular', 'irreg. conj.'],
  ] },
  person: { label: 'Person', group: 'verbal', options: [['1', 'First', '1st'], ['2', 'Second', '2nd'], ['3', 'Third', '3rd']] },
  tense: { label: 'Tense', group: 'verbal', options: [
    ['present', 'Present', 'pres.'], ['imperfect', 'Imperfect', 'impf.'], ['future', 'Future', 'fut.'],
    ['perfect', 'Perfect', 'perf.'], ['pluperfect', 'Pluperfect', 'plup.'], ['future-perfect', 'Future perfect', 'fut. perf.'],
  ] },
  mood: { label: 'Mood / infinitive', group: 'verbal', options: [
    ['indicative', 'Indicative', 'ind.'], ['subjunctive', 'Subjunctive', 'subj.'],
    ['imperative', 'Imperative', 'imp.'], ['infinitive', 'Infinitive', 'inf.'],
  ] },
  voice: { label: 'Voice (form)', group: 'verbal', options: [['active', 'Active', 'act.'], ['passive', 'Passive', 'pass.']] },
};

export function cleanMarkup(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result = {};
  for (const [key, field] of Object.entries(fields)) {
    if (field.options.some(([id]) => id === value[key])) result[key] = value[key];
  }
  if (value.uncertain === true) result.uncertain = true;
  if (typeof value.note === 'string' && value.note.trim()) result.note = value.note.trim();
  return result;
}

export function cleanGrammar(value, words) {
  const result = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
  for (const [key, raw] of Object.entries(value)) {
    const index = Number(key);
    if (!Number.isInteger(index) || String(index) !== key || index < 0 || index >= words.length || !/\p{L}/u.test(words[index])) continue;
    const markup = cleanMarkup(raw);
    if (Object.keys(markup).length) result[key] = markup;
  }
  return result;
}

export function describeMarkup(value, compact = false) {
  const markup = cleanMarkup(value);
  const order = ['part', 'declension', 'conjugation', 'person', 'case', 'number', 'gender', 'tense', 'mood', 'voice', 'degree'];
  const labels = order.flatMap(key => {
    const option = fields[key].options.find(([id]) => id === markup[key]);
    return option ? [compact ? option[2] : `${fields[key].label}: ${option[1]}`] : [];
  });
  if (markup.uncertain) labels.push(compact ? '?' : 'Uncertain');
  if (markup.note) labels.push(compact ? 'note' : `Note: ${markup.note}`);
  return labels.join(compact ? ' · ' : '; ');
}
