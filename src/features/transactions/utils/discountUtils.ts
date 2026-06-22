import { DiscountType } from '../api/transactionService';

export interface DiscountFields {
  discountType?: DiscountType | null;
  discountValue?: number | null;
}

export interface LineTotals {
  subtotal: number;
  amount: number;
  discountAmount: number;
}

export interface TransactionTotals {
  lines: LineTotals[];
  subtotal: number;
  totalAmount: number;
  discountAmount: number;
  transactionDiscountAmount: number;
  lineDiscountTotal: number;
}

export function applyDiscount(
  subtotal: number,
  discount?: DiscountFields,
): { amount: number; discountAmount: number } {
  if (
    !discount?.discountType ||
    discount.discountValue == null ||
    discount.discountValue <= 0
  ) {
    return { amount: subtotal, discountAmount: 0 };
  }

  let discountAmount = 0;
  if (discount.discountType === 'PERCENT') {
    const pct = Math.min(discount.discountValue, 100);
    discountAmount = subtotal * (pct / 100);
  } else {
    discountAmount = Math.min(discount.discountValue, subtotal);
  }

  return {
    amount: Math.max(0, subtotal - discountAmount),
    discountAmount,
  };
}

export function calcLineAmount(item: {
  quantity: number;
  unitPrice: number;
  discountType?: DiscountType | null;
  discountValue?: number | null;
}): LineTotals {
  const subtotal = item.quantity * item.unitPrice;
  const { amount, discountAmount } = applyDiscount(subtotal, item);
  return { subtotal, amount, discountAmount };
}

export function calcTransactionTotals(
  items: Array<{
    quantity: number;
    unitPrice: number;
    discountType?: DiscountType | null;
    discountValue?: number | null;
  }>,
  transactionDiscount?: DiscountFields,
): TransactionTotals {
  const lines = items.map(calcLineAmount);
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const { amount: totalAmount, discountAmount: transactionDiscountAmount } =
    applyDiscount(subtotal, transactionDiscount);
  const lineDiscountTotal = lines.reduce(
    (sum, line) => sum + line.discountAmount,
    0,
  );

  return {
    lines,
    subtotal,
    totalAmount,
    discountAmount: lineDiscountTotal + transactionDiscountAmount,
    transactionDiscountAmount,
    lineDiscountTotal,
  };
}

export type DiscountValidationKey =
  | 'discount_pair_required'
  | 'discount_value_positive'
  | 'discount_percent_max';

export function validateDiscount(
  type?: DiscountType | null,
  value?: number | null,
): DiscountValidationKey | null {
  const hasType = type != null;
  const hasValue = value != null && !Number.isNaN(value);

  if (!hasType && !hasValue) return null;
  if (hasType !== hasValue) return 'discount_pair_required';
  if (value! <= 0) return 'discount_value_positive';
  if (type === 'PERCENT' && value! > 100) return 'discount_percent_max';
  return null;
}

export function formatMoney(value: number): string {
  return value.toFixed(2);
}
