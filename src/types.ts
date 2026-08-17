export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  iconName: string;
  color?: string;
  isCustom?: boolean;
}

export interface Movement {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  paymentMethod: PaymentMethod;
  createdAt: number;
  fixedPaymentId?: string; // If originated from a fixed payment
}

export interface FixedPayment {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1 - 31
  categoryId: string;
  notes?: string;
  reminderActive?: boolean;
}

export interface FixedPaymentMonthRecord {
  isPaid: boolean;
  paidDate?: string;
  movementId?: string;
  overrideAmount?: number;
}

export interface BudgetLimit {
  categoryId: string;
  monthlyLimit: number;
}

export type ActiveTab = 'dashboard' | 'movements' | 'fixed_payments' | 'budget';

export interface MonthSummary {
  year: number;
  month: number; // 0-indexed (0 = Enero, 11 = Diciembre)
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  previousMonthExpense: number;
  previousMonthIncome: number;
  pendingFixedAmount: number;
  paidFixedAmount: number;
  totalFixedAmount: number;
  pendingFixedCount: number;
  paidFixedCount: number;
}

export interface BudgetAlert {
  categoryId: string;
  categoryName: string;
  spent: number;
  limit: number;
  percentage: number;
  isCritical: boolean; // >= 100%
  isWarning: boolean;  // >= 80% and < 100%
}
