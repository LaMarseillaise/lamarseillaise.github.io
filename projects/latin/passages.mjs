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
  {
    id: '3-regum-3-16-21', title: 'Vulgata · Solomon’s judgment · 3:16–21 (1 of 3)',
    source: 'https://www.drbo.org/lvb/chapter/11003.htm',
    text: 'Tunc venerunt duae mulieres meretrices ad regem, steteruntque coram eo, quarum una ait : Obsecro, mi domine : ego et mulier haec habitabamus in domo una, et peperi apud eam in cubiculo. Tertia autem die postquam ego peperi, peperit et haec : et eramus simul, nullusque alius nobiscum in domo, exceptis nobis duabus. Mortuus est autem filius mulieris hujus nocte. Dormiens quippe oppressit eum. Et consurgens intempestae noctis silentio, tulit filium meum de latere meo, ancillae tuae dormientis, et collocavit in sinu suo : suum autem filium, qui erat mortuus, posuit in sinu meo. Cumque surrexissem mane ut darem lac filio meo, apparuit mortuus : quem diligentius intuens clara luce, deprehendi non esse meum quem genueram.',
    note: 'III Regum 3:16–21 (1 Kings in modern numbering). The complete episode, verses 16–28, is divided into three consecutive readings. Wording and punctuation follow DRBO; verse numbers are omitted. Each reading keeps its own draft and connections.',
  },
  {
    id: '3-regum-3-22-25', title: 'Vulgata · Solomon’s judgment · 3:22–25 (2 of 3)',
    source: 'https://www.drbo.org/lvb/chapter/11003.htm',
    text: 'Responditque altera mulier : Non est ita ut dicis, sed filius tuus mortuus est, meum autem vivit. E contrario illa dicebat : Mentiris : filius quippe meus vivit, et filius tuus mortuus est. Atque in hunc modum contendebant coram rege. Tunc rex ait : Haec dicit : Filius meus vivit, et filius tuus mortuus est : et ista respondit : Non, sed filius tuus mortuus est, meus autem vivit. Dixit ergo rex : Afferte mihi gladium. Cumque attulissent gladium coram rege, Dividite, inquit, infantem vivum in duas partes, et date dimidiam partem uni, et dimidiam partem alteri.',
    note: 'III Regum 3:22–25 (1 Kings in modern numbering), the second of three consecutive readings. The text retains DRBO’s wording, including “meum autem vivit” in verse 22. Translation and annotations are left to you.',
  },
  {
    id: '3-regum-3-26-28', title: 'Vulgata · Solomon’s judgment · 3:26–28 (3 of 3)',
    source: 'https://www.drbo.org/lvb/chapter/11003.htm',
    text: 'Dixit autem mulier, cujus filius erat vivus, ad regem ( commota sunt quippe viscera ejus super filio suo) : Obsecro, domine, date illi infantem vivum, et nolite interficere eum. E contrario illa dicebat : Nec mihi, nec tibi sit, sed dividatur. Respondit rex, et ait : Date huic infantem vivum, et non occidatur : haec est enim mater ejus. Audivit itaque omnis Israel judicium quod judicasset rex, et timuerunt regem, videntes sapientiam Dei esse in eo ad faciendum judicium.',
    note: 'III Regum 3:26–28 (1 Kings in modern numbering), the final reading in the episode. The Latin follows DRBO. No translation or pre-solved connections are supplied.',
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
