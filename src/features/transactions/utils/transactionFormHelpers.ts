import { ItemDTO } from '../../items/api/itemService';
import {
  DiscountType,
  TransactionItemDTO,
} from '../api/transactionService';
import { validateDiscount } from '../utils/discountUtils';

export function getItemDisplayName(
  item: TransactionItemDTO,
  inventoryItems: ItemDTO[],
): string {
  if (item.itemName) return item.itemName;
  if (item.itemId) {
    const inv = inventoryItems.find(i => i.id === item.itemId);
    if (inv) return inv.name;
  }
  return item.category || 'Item';
}

export function buildTransactionItems(
  cart: Record<string, TransactionItemDTO>,
  type: 'INCOME' | 'EXPENSE',
): TransactionItemDTO[] {
  return Object.values(cart).map(item => ({
    itemId: item.itemId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    type,
    category: item.category?.trim() || undefined,
    reason: item.reason,
    notes: item.notes,
  }));
}

export function validateTransactionDiscount(
  transactionDiscountType?: DiscountType | null,
  transactionDiscountValue?: string,
): string | null {
  const parsed =
    transactionDiscountValue !== '' && transactionDiscountValue != null
      ? parseFloat(transactionDiscountValue)
      : undefined;
  return validateDiscount(transactionDiscountType, parsed);
}

export function parseTransactionDiscount(
  type?: DiscountType | null,
  valueStr?: string,
): { discountType?: DiscountType; discountValue?: number } {
  if (!type || !valueStr) return {};
  const parsed = parseFloat(valueStr);
  if (Number.isNaN(parsed) || parsed <= 0) return {};
  return { discountType: type, discountValue: parsed };
}
