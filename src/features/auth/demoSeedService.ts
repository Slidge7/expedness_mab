import { authService } from './api/authService';
import { DEMO_ACCOUNT } from './demoAccount';
import { itemService } from '../items/api/itemService';
import { stockService } from '../stock/api/stockService';

/**
 * Ensures the demo user exists (registers on first use).
 */
export async function ensureDemoAccountRegistered() {
  try {
    return await authService.login({
      username: DEMO_ACCOUNT.username,
      password: DEMO_ACCOUNT.password,
    });
  } catch (error: any) {
    if (error.response?.status !== 401) throw error;
    return await authService.register({
      username: DEMO_ACCOUNT.username,
      email: 'farisse@demo.expedness.local',
      password: DEMO_ACCOUNT.password,
    });
  }
}

/**
 * Enables stock tracking on demo items when none are configured yet.
 * Safe to call on every demo login.
 */
export async function ensureDemoStockData(): Promise<boolean> {
  const stockItems = await stockService.getAll();
  if (stockItems.length > 0) return false;

  const items = await itemService.getAll();
  const officeSupplies = items.find(i => i.name === 'Office Supplies');
  const laptop = items.find(i => i.name === 'Laptop');

  if (officeSupplies?.id) {
    await stockService.enable(officeSupplies.id, 120, 20);
  }

  if (laptop?.id) {
    await stockService.enable(laptop.id, 5, 2);
  }

  return true;
}
