// Synthetic teaching model. Counts are deliberately bounded; this is not a SQL engine.
export function explore(paymentCount, refundCount) {
  if (!Number.isInteger(paymentCount) || paymentCount < 1 || paymentCount > 3 ||
      !Number.isInteger(refundCount) || refundCount < 0 || refundCount > 3) {
    throw new RangeError('Choose 1–3 payments and 0–3 refunds.');
  }
  const payments = Array.from({length: paymentCount}, (_, i) => ({id: i + 1, cents: 1000}));
  const refunds = Array.from({length: refundCount}, (_, i) => ({id: i + 1, paymentId: 1, cents: (i + 1) * 100}));
  const joined = payments.flatMap(payment => {
    const matches = refunds.filter(refund => refund.paymentId === payment.id);
    return (matches.length ? matches : [null]).map(refund => ({payment, refund}));
  });
  const events = [
    ...payments.map(p => ({label: `Payment P${p.id}`, cents: p.cents})),
    ...refunds.map(r => ({label: `Refund R${r.id}`, cents: -r.cents}))
  ];
  const joinedPayments = joined.reduce((total, row) => total + row.payment.cents, 0);
  const refundTotal = refunds.reduce((total, row) => total + row.cents, 0);
  return {payments, refunds, joined, events,
    joinedTotal: joinedPayments - refundTotal,
    distinctTotal: [...new Set(joined.map(row => row.payment.cents))].reduce((a, b) => a + b, 0) - refundTotal,
    eventTotal: events.reduce((total, event) => total + event.cents, 0)};
}
