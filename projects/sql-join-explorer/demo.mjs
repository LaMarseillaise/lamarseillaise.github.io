import {explore} from './model.mjs';
const element = id => document.getElementById(id);
const money = cents => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(cents / 100);
function rows(id, records) {
  element(id).replaceChildren(...records.map(record => {
    const row = document.createElement('tr');
    if (record.repeated) row.className = 'repeated';
    for (const value of record.cells) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    }
    return row;
  }));
}
function render() {
  const model = explore(Number(element('payments').value), Number(element('refunds').value));
  rows('payment-rows', model.payments.map(p => ({cells: [`P${p.id}`, money(p.cents)]})));
  rows('refund-rows', model.refunds.length ? model.refunds.map(r => ({cells: [`R${r.id}`, `P${r.paymentId}`, money(r.cents)]})) : [{cells: ['None', '—', '—']}]);
  rows('joined-rows', model.joined.map(({payment, refund}) => ({
    repeated: payment.id === 1 && model.refunds.length > 1,
    cells: [`P${payment.id}`, money(payment.cents), refund ? `R${refund.id}` : 'NULL', refund ? money(refund.cents) : 'NULL']
  })));
  rows('event-rows', model.events.map(e => ({cells: [e.label, (e.cents > 0 ? '+' : '') + money(e.cents)]})));
  element('row-note').textContent = model.refunds.length > 1
    ? `P1 appears ${model.refunds.length} times (highlighted), but it is one payment. The join has ${model.joined.length} rows.`
    : `The join has ${model.joined.length} row${model.joined.length === 1 ? '' : 's'}. Each payment appears once in this example; NULL means no matching refund.`;
  element('joined-total').textContent = money(model.joinedTotal);
  element('distinct-total').textContent = money(model.distinctTotal);
  element('event-total').textContent = money(model.eventTotal);
  element('joined-explanation').textContent = model.joinedTotal === model.eventTotal
    ? 'Matches here: there is no payment duplication. Add a second refund to reveal the bug.'
    : `Too high by ${money(model.joinedTotal - model.eventTotal)}. The payment amount is added again for each extra refund row.`;
  element('distinct-explanation').textContent = model.distinctTotal === model.eventTotal
    ? 'Matches this example, but try adding a second $10 payment.'
    : `Too low by ${money(model.eventTotal - model.distinctTotal)}. Equal amounts have collapsed into one value.`;
}
for (const id of ['payments','refunds']) element(id).addEventListener('change', render);
element('reset').addEventListener('click', () => { element('payments').value = '1'; element('refunds').value = '2'; render(); });
render();
element('interactive').hidden = false;
element('controls').disabled = false;
