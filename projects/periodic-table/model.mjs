// Display geometry is independent of chemistry: the 15-member series are
// presented together without making a claim about the disputed group-3 boundary.
export function position(z, wide = false) {
  if (!Number.isInteger(z) || z < 1 || z > 118) throw new RangeError('Atomic number must be 1–118');
  const starts = [1, 3, 11, 19, 37, 55, 87];
  const period = starts.findLastIndex(start => z >= start) + 1;
  const offset = z - starts[period - 1];
  let col;
  if (period === 1) col = z === 1 ? 1 : 18;
  else if (period <= 3) col = offset < 2 ? offset + 1 : offset + 11;
  else if (period <= 5) col = offset + 1;
  else {
    if (wide) return { row: period, col: offset + 1 };
    if (offset >= 2 && offset <= 16) return { row: period + 3, col: offset + 1 };
    col = offset < 2 ? offset + 1 : offset - 13;
  }
  return { row: period, col: wide && col >= 3 ? col + 14 : col };
}

export function subshells(element, elements) {
  const core = element.configuration.match(/\[([A-Z][a-z]?)\]/);
  const inherited = core ? subshells(elements.find(e => e.symbol === core[1]), elements) : [];
  const own = [...element.configuration.matchAll(/(\d)([spdf])(\d+)/g)]
    .map(([,n,l,count]) => ({ n:Number(n), l, count:Number(count) }));
  return [...inherited, ...own].sort((a,b) => a.n-b.n || 'spdf'.indexOf(a.l)-'spdf'.indexOf(b.l));
}

export function shells(element, elements) {
  return subshells(element, elements).reduce((result, {n,count}) => {
    result[n-1] = (result[n-1] || 0) + count;
    return result;
  }, []);
}

export function findElement(query, elements) {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return elements.find(e => String(e.z) === q || e.symbol.toLowerCase() === q || e.name.toLowerCase() === q)
    || elements.find(e => e.name.toLowerCase().startsWith(q)) || null;
}

export function halfLife(isotope) {
  if (isotope.half_life === 'STABLE') return 'Stable in this evaluation';
  if (!isotope.half_life) return 'Not supplied';
  const units = {Y:'years',d:'days',h:'hours',m:'minutes',s:'s',ms:'ms',us:'μs',ns:'ns',ps:'ps',as:'as'};
  const operator = {GT:'> ',LT:'< ',GE:'≥ ',LE:'≤ ',AP:'≈ '}[isotope.operator_hl] || '';
  const uncertainty = isotope.unc_hl ? ` (${isotope.unc_hl})` : '';
  return `${operator}${isotope.half_life}${uncertainty} ${units[isotope.unit_hl] || isotope.unit_hl || ''}`.trim();
}

export function initialIsotope(element) {
  return [...element.isotopes].sort((a,b) => Number(b.abundance || 0)-Number(a.abundance || 0))[0];
}
