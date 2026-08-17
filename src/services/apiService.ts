import { Movement, Category, FixedPayment, BudgetLimit, FixedPaymentMonthRecord } from '../types';

export interface ServerState {
  categories: Category[];
  movements: Movement[];
  fixedPayments: FixedPayment[];
  budgetLimits: BudgetLimit[];
  fixedPaymentMonthStatus: Record<string, Record<string, FixedPaymentMonthRecord>>;
}

export async function fetchServerState(): Promise<ServerState | null> {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch state from PostgreSQL API, falling back to local:', err);
    return null;
  }
}

export async function apiAddMovement(movement: Movement): Promise<boolean> {
  try {
    const res = await fetch('/api/movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movement),
    });
    return res.ok;
  } catch (err) {
    console.error('apiAddMovement error:', err);
    return false;
  }
}

export async function apiDeleteMovement(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/movements/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('apiDeleteMovement error:', err);
    return false;
  }
}

export async function apiAddFixedPayment(fp: FixedPayment): Promise<boolean> {
  try {
    const res = await fetch('/api/fixed-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fp),
    });
    return res.ok;
  } catch (err) {
    console.error('apiAddFixedPayment error:', err);
    return false;
  }
}

export async function apiDeleteFixedPayment(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/fixed-payments/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('apiDeleteFixedPayment error:', err);
    return false;
  }
}

export async function apiToggleFixedPaymentStatus(payload: {
  year: number;
  month: number;
  fixedPaymentId: string;
  isPaid: boolean;
  paidDate?: string;
  movementId?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/fixed-payments/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.error('apiToggleFixedPaymentStatus error:', err);
    return false;
  }
}

export async function apiAddCategory(category: Category): Promise<boolean> {
  try {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    return res.ok;
  } catch (err) {
    console.error('apiAddCategory error:', err);
    return false;
  }
}

export async function apiUpdateBudgetLimit(categoryId: string, monthlyLimit: number): Promise<boolean> {
  try {
    const res = await fetch('/api/budget-limits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, monthlyLimit }),
    });
    return res.ok;
  } catch (err) {
    console.error('apiUpdateBudgetLimit error:', err);
    return false;
  }
}

export async function apiResetDatabase(): Promise<boolean> {
  try {
    const res = await fetch('/api/db/seed', { method: 'POST' });
    return res.ok;
  } catch (err) {
    console.error('apiResetDatabase error:', err);
    return false;
  }
}

export async function apiImportBackup(data: any): Promise<boolean> {
  try {
    const res = await fetch('/api/import-backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.error('apiImportBackup error:', err);
    return false;
  }
}
