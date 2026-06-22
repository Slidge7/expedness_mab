import type { TFunction } from 'i18next';

export function translateTransactionType(
  t: TFunction,
  type: 'INCOME' | 'EXPENSE' | 'ALL',
): string {
  return t(`types.${type.toLowerCase()}`);
}

export function translateMissionStatus(
  t: TFunction,
  status: string,
): string {
  const key = status.toLowerCase().replace(/ /g, '_');
  return t(`status.${key}`, { defaultValue: status.replace(/_/g, ' ') });
}
