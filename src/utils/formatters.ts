import { PaymentMethod } from '../types';

export const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MONTH_SHORT_NAMES_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export function formatMXN(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$0.00';
  }
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMXNSigned(amount: number, type?: 'income' | 'expense'): string {
  const formatted = formatMXN(Math.abs(amount));
  if (type === 'income' || (!type && amount > 0)) {
    return `+${formatted}`;
  }
  if (type === 'expense' || (!type && amount < 0)) {
    return `-${formatted}`;
  }
  return formatted;
}

export function getMonthKey(year: number, month: number): string {
  const m = String(month + 1).padStart(2, '0');
  return `${year}-${m}`;
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [yearStr, monthStr] = key.split('-');
  return {
    year: parseInt(yearStr, 10),
    month: parseInt(monthStr, 10) - 1
  };
}

export function formatDateShort(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[0];
  return `${day} ${MONTH_SHORT_NAMES_ES[monthIdx]} ${year}`;
}

export function formatDateDayOnly(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parseInt(parts[2], 10)} de ${MONTH_NAMES_ES[parseInt(parts[1], 10) - 1]}`;
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'cash':
      return 'Efectivo';
    case 'card':
      return 'Tarjeta';
    case 'transfer':
      return 'Transferencia';
    case 'other':
      return 'Otro';
    default:
      return 'Efectivo';
  }
}

export function calculateDueStatus(dueDay: number, selectedYear: number, selectedMonth: number): {
  status: 'upcoming' | 'today' | 'overdue' | 'future';
  daysDiff: number;
  label: string;
} {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  // If viewing a previous month
  if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
    return {
      status: 'overdue',
      daysDiff: 0,
      label: `Venció el día ${dueDay}`
    };
  }

  // If viewing a future month
  if (selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonth)) {
    return {
      status: 'future',
      daysDiff: 0,
      label: `Vence el día ${dueDay}`
    };
  }

  // Viewing current month
  const diff = dueDay - currentDay;
  if (diff === 0) {
    return {
      status: 'today',
      daysDiff: 0,
      label: '¡Vence hoy!'
    };
  } else if (diff > 0) {
    return {
      status: 'upcoming',
      daysDiff: diff,
      label: diff === 1 ? 'Vence mañana' : `Vence en ${diff} días`
    };
  } else {
    const overdueDays = Math.abs(diff);
    return {
      status: 'overdue',
      daysDiff: diff,
      label: overdueDays === 1 ? 'Vencido hace 1 día' : `Vencido hace ${overdueDays} días`
    };
  }
}
