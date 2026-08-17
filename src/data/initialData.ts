import { Category, Movement, FixedPayment, BudgetLimit } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Gastos
  { id: 'cat-vivienda', name: 'Vivienda & Renta', type: 'expense', iconName: 'Home', color: '#8B5A2B' },
  { id: 'cat-servicios', name: 'Servicios (Luz, Agua, Gas)', type: 'expense', iconName: 'Zap', color: '#D97706' },
  { id: 'cat-alimentos', name: 'Alimentación & Súper', type: 'expense', iconName: 'ShoppingCart', color: '#059669' },
  { id: 'cat-transporte', name: 'Transporte & Gasolina', type: 'expense', iconName: 'Car', color: '#2563EB' },
  { id: 'cat-suscripciones', name: 'Suscripciones & Streaming', type: 'expense', iconName: 'Tv', color: '#7C3AED' },
  { id: 'cat-salud', name: 'Salud & Farmacia', type: 'expense', iconName: 'HeartPulse', color: '#DC2626' },
  { id: 'cat-entretenimiento', name: 'Ocio & Salidas', type: 'expense', iconName: 'Coffee', color: '#EA580C' },
  { id: 'cat-educacion', name: 'Educación & Cursos', type: 'expense', iconName: 'GraduationCap', color: '#4F46E5' },
  { id: 'cat-otros-gastos', name: 'Otros Gastos', type: 'expense', iconName: 'Tag', color: '#64748B' },

  // Ingresos
  { id: 'cat-sueldo', name: 'Sueldo & Nómina', type: 'income', iconName: 'Briefcase', color: '#2E6F4E' },
  { id: 'cat-freelance', name: 'Honorarios & Proyectos', type: 'income', iconName: 'Laptop', color: '#16A34A' },
  { id: 'cat-rendimientos', name: 'Inversiones & Rendimientos', type: 'income', iconName: 'TrendingUp', color: '#0D9488' },
  { id: 'cat-otros-ingresos', name: 'Otros Ingresos', type: 'income', iconName: 'PlusCircle', color: '#10B981' },
];

export const DEFAULT_BUDGET_LIMITS: BudgetLimit[] = [
  { categoryId: 'cat-vivienda', monthlyLimit: 12000 },
  { categoryId: 'cat-servicios', monthlyLimit: 2500 },
  { categoryId: 'cat-alimentos', monthlyLimit: 7500 },
  { categoryId: 'cat-transporte', monthlyLimit: 3200 },
  { categoryId: 'cat-suscripciones', monthlyLimit: 1100 },
  { categoryId: 'cat-salud', monthlyLimit: 1800 },
  { categoryId: 'cat-entretenimiento', monthlyLimit: 3000 },
  { categoryId: 'cat-educacion', monthlyLimit: 2000 },
  { categoryId: 'cat-otros-gastos', monthlyLimit: 1500 },
];

export const DEFAULT_FIXED_PAYMENTS: FixedPayment[] = [
  {
    id: 'fix-1',
    name: 'Renta del Departamento',
    amount: 11500,
    dueDay: 5,
    categoryId: 'cat-vivienda',
    notes: 'Transferencia directa al arrendador (Banamex)'
  },
  {
    id: 'fix-2',
    name: 'Servicio de Internet Fibra Óptica',
    amount: 699,
    dueDay: 12,
    categoryId: 'cat-servicios',
    notes: 'Totalplay 300 Mbps'
  },
  {
    id: 'fix-3',
    name: 'Recibo de Luz CFE',
    amount: 850,
    dueDay: 18,
    categoryId: 'cat-servicios',
    notes: 'Bimestral - Pago con tarjeta'
  },
  {
    id: 'fix-4',
    name: 'Membresía Smart Fit / Gimnasio',
    amount: 659,
    dueDay: 20,
    categoryId: 'cat-salud',
    notes: 'Cargo automático a tarjeta de débito'
  },
  {
    id: 'fix-5',
    name: 'Plataformas Streaming (Spotify + Netflix)',
    amount: 429,
    dueDay: 24,
    categoryId: 'cat-suscripciones',
    notes: 'Plan familiar compartido'
  },
  {
    id: 'fix-6',
    name: 'Plan Teléfono Celular',
    amount: 499,
    dueDay: 28,
    categoryId: 'cat-servicios',
    notes: 'Telcel Max Sin Límite'
  }
];

export const SAMPLE_MOVEMENTS: Movement[] = [
  // Mes actual: Agosto 2026
  {
    id: 'mov-aug-1',
    date: '2026-08-01',
    type: 'income',
    amount: 22000,
    categoryId: 'cat-sueldo',
    description: 'Primera quincena sueldo',
    paymentMethod: 'transfer',
    createdAt: 1785500000000
  },
  {
    id: 'mov-aug-2',
    date: '2026-08-03',
    type: 'expense',
    amount: 1850,
    categoryId: 'cat-alimentos',
    description: 'Despensa quincenal en Costco',
    paymentMethod: 'card',
    createdAt: 1785600000000
  },
  {
    id: 'mov-aug-3',
    date: '2026-08-05',
    type: 'expense',
    amount: 11500,
    categoryId: 'cat-vivienda',
    description: 'Pago Renta del Departamento',
    paymentMethod: 'transfer',
    createdAt: 1785700000000,
    fixedPaymentId: 'fix-1'
  },
  {
    id: 'mov-aug-4',
    date: '2026-08-07',
    type: 'expense',
    amount: 800,
    categoryId: 'cat-transporte',
    description: 'Carga de Gasolina Magna',
    paymentMethod: 'card',
    createdAt: 1785800000000
  },
  {
    id: 'mov-aug-5',
    date: '2026-08-09',
    type: 'income',
    amount: 5500,
    categoryId: 'cat-freelance',
    description: 'Proyecto diseño web cliente freelance',
    paymentMethod: 'transfer',
    createdAt: 1785900000000
  },
  {
    id: 'mov-aug-6',
    date: '2026-08-11',
    type: 'expense',
    amount: 1250,
    categoryId: 'cat-alimentos',
    description: 'Súper semanal en Walmart Express',
    paymentMethod: 'card',
    createdAt: 1786000000000
  },
  {
    id: 'mov-aug-7',
    date: '2026-08-12',
    type: 'expense',
    amount: 699,
    categoryId: 'cat-servicios',
    description: 'Servicio de Internet Fibra Óptica',
    paymentMethod: 'card',
    createdAt: 1786100000000,
    fixedPaymentId: 'fix-2'
  },
  {
    id: 'mov-aug-8',
    date: '2026-08-14',
    type: 'expense',
    amount: 1420,
    categoryId: 'cat-entretenimiento',
    description: 'Cena con amigos en restaurante',
    paymentMethod: 'card',
    createdAt: 1786200000000
  },
  {
    id: 'mov-aug-9',
    date: '2026-08-15',
    type: 'income',
    amount: 22000,
    categoryId: 'cat-sueldo',
    description: 'Segunda quincena sueldo',
    paymentMethod: 'transfer',
    createdAt: 1786300000000
  },
  {
    id: 'mov-aug-10',
    date: '2026-08-16',
    type: 'expense',
    amount: 620,
    categoryId: 'cat-alimentos',
    description: 'Mercado local frutas y verduras',
    paymentMethod: 'cash',
    createdAt: 1786400000000
  },

  // Mes anterior: Julio 2026 (para comparativa en gráficos)
  {
    id: 'mov-jul-1',
    date: '2026-07-01',
    type: 'income',
    amount: 22000,
    categoryId: 'cat-sueldo',
    description: 'Primera quincena sueldo',
    paymentMethod: 'transfer',
    createdAt: 1782800000000
  },
  {
    id: 'mov-jul-2',
    date: '2026-07-05',
    type: 'expense',
    amount: 11500,
    categoryId: 'cat-vivienda',
    description: 'Renta departamento julio',
    paymentMethod: 'transfer',
    createdAt: 1783200000000
  },
  {
    id: 'mov-jul-3',
    date: '2026-07-10',
    type: 'expense',
    amount: 5400,
    categoryId: 'cat-alimentos',
    description: 'Compras y súper del mes',
    paymentMethod: 'card',
    createdAt: 1783600000000
  },
  {
    id: 'mov-jul-4',
    date: '2026-07-15',
    type: 'income',
    amount: 22000,
    categoryId: 'cat-sueldo',
    description: 'Segunda quincena sueldo',
    paymentMethod: 'transfer',
    createdAt: 1784000000000
  },
  {
    id: 'mov-jul-5',
    date: '2026-07-18',
    type: 'expense',
    amount: 2400,
    categoryId: 'cat-servicios',
    description: 'Servicios generales julio',
    paymentMethod: 'card',
    createdAt: 1784300000000
  },
  {
    id: 'mov-jul-6',
    date: '2026-07-22',
    type: 'expense',
    amount: 2800,
    categoryId: 'cat-transporte',
    description: 'Gasolina y mantenimiento auto',
    paymentMethod: 'card',
    createdAt: 1784700000000
  },
  {
    id: 'mov-jul-7',
    date: '2026-07-28',
    type: 'expense',
    amount: 2100,
    categoryId: 'cat-entretenimiento',
    description: 'Salidas y cine julio',
    paymentMethod: 'card',
    createdAt: 1785200000000
  }
];

// Initial state of paid fixed items for August 2026
export const INITIAL_FIXED_PAYMENTS_STATUS: Record<string, Record<string, { isPaid: boolean; paidDate?: string; movementId?: string }>> = {
  '2026-08': {
    'fix-1': { isPaid: true, paidDate: '2026-08-05', movementId: 'mov-aug-3' },
    'fix-2': { isPaid: true, paidDate: '2026-08-12', movementId: 'mov-aug-7' },
    'fix-3': { isPaid: false },
    'fix-4': { isPaid: false },
    'fix-5': { isPaid: false },
    'fix-6': { isPaid: false },
  },
  '2026-07': {
    'fix-1': { isPaid: true, paidDate: '2026-07-05' },
    'fix-2': { isPaid: true, paidDate: '2026-07-12' },
    'fix-3': { isPaid: true, paidDate: '2026-07-18' },
    'fix-4': { isPaid: true, paidDate: '2026-07-20' },
    'fix-5': { isPaid: true, paidDate: '2026-07-24' },
    'fix-6': { isPaid: true, paidDate: '2026-07-28' },
  }
};
