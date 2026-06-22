import {
  applyDiscount,
  calcLineAmount,
  calcTransactionTotals,
  validateDiscount,
} from './discountUtils';

describe('discountUtils', () => {
  it('matches backend example: line FIXED then transaction PERCENT', () => {
    const line = calcLineAmount({
      quantity: 2,
      unitPrice: 100,
      discountType: 'FIXED',
      discountValue: 10,
    });
    expect(line.subtotal).toBe(200);
    expect(line.amount).toBe(190);
    expect(line.discountAmount).toBe(10);

    const totals = calcTransactionTotals(
      [
        {
          quantity: 2,
          unitPrice: 100,
          discountType: 'FIXED',
          discountValue: 10,
        },
      ],
      { discountType: 'PERCENT', discountValue: 5 },
    );
    expect(totals.subtotal).toBe(190);
    expect(totals.totalAmount).toBe(180.5);
  });

  it('caps FIXED discount at subtotal', () => {
    const { amount, discountAmount } = applyDiscount(50, {
      discountType: 'FIXED',
      discountValue: 100,
    });
    expect(amount).toBe(0);
    expect(discountAmount).toBe(50);
  });

  it('validates discount pairs', () => {
    expect(validateDiscount('PERCENT', 10)).toBeNull();
    expect(validateDiscount('PERCENT', undefined)).toBe('discount_pair_required');
    expect(validateDiscount(null, 5)).toBe('discount_pair_required');
    expect(validateDiscount('PERCENT', 0)).toBe('discount_value_positive');
    expect(validateDiscount('PERCENT', 101)).toBe('discount_percent_max');
  });
});
