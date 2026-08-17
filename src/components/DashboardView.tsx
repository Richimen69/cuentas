import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  AlertTriangle,
  Receipt,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart2,
  CalendarCheck
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Category, BudgetAlert, MonthSummary, Movement, FixedPayment, FixedPaymentMonthRecord, BudgetLimit } from '../types';
import { formatMXN, formatDateShort, MONTH_SHORT_NAMES_ES, calculateDueStatus } from '../utils/formatters';
import { StampBadge } from './StampBadge';

interface DashboardViewProps {
  summary: MonthSummary;
  categoryExpenses: { category: Category; amount: number; percentage: number }[];
  budgetAlerts: BudgetAlert[];
  recentMovements?: Movement[];
  fixedPayments?: FixedPayment[];
  monthStatus?: Record<string, FixedPaymentMonthRecord>;
  categories?: Category[];
  budgetLimits?: BudgetLimit[];
  onNavigateToMovements: () => void;
  onNavigateToFixedPayments: () => void;
  onNavigateToBudget: () => void;
  onOpenAddMovement: () => void;
  onToggleFixedPaid?: (id: string, isPaid: boolean) => void;
}

const PIE_COLORS = [
  '#2E6F4E', '#D97706', '#2563EB', '#A33B2E', '#7C3AED', 
  '#059669', '#EA580C', '#4F46E5', '#8B5A2B', '#0D9488', 
  '#DB2777', '#64748B'
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  categoryExpenses,
  budgetAlerts,
  recentMovements = [],
  fixedPayments = [],
  monthStatus = {},
  categories = [],
  budgetLimits = [],
  onNavigateToMovements,
  onNavigateToFixedPayments,
  onNavigateToBudget,
  onOpenAddMovement,
  onToggleFixedPaid,
}) => {
  const isBalancePositive = summary.netBalance >= 0;

  // Category Map
  const categoryMap = React.useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Data for Category Donut Chart
  const pieData = categoryExpenses.map((item) => ({
    name: item.category.name,
    value: item.amount,
    color: item.category.color || PIE_COLORS[0],
    percentage: item.percentage
  }));

  // Data for Monthly Comparison Bar Chart
  const prevMonthIndex = summary.month === 0 ? 11 : summary.month - 1;
  const barData = [
    {
      name: `${MONTH_SHORT_NAMES_ES[prevMonthIndex]} (Ant.)`,
      Ingresos: summary.previousMonthIncome,
      Egresos: summary.previousMonthExpense,
    },
    {
      name: `${MONTH_SHORT_NAMES_ES[summary.month]} (Actual)`,
      Ingresos: summary.totalIncome,
      Egresos: summary.totalExpense,
    },
  ];

  // Custom Tooltip for Charts with High Density Ledger Paper Styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#FAF6EC] border border-[#1F2A22] p-2.5 rounded shadow-md font-mono text-xs text-[#2C2724]">
          <p className="font-serif font-bold text-xs text-[#1F2A22] mb-1">
            {payload[0].payload.name || payload[0].name}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3 my-0.5">
              <span style={{ color: entry.color || entry.fill || '#1F2A22' }} className="font-semibold">
                {entry.name}:
              </span>
              <span className="font-bold text-[#1F2A22]">
                {formatMXN(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Top budget categories preview
  const budgetPreview = React.useMemo(() => {
    const spendingMap = new Map<string, number>();
    recentMovements.forEach((m) => {
      if (m.type === 'expense') {
        const cur = spendingMap.get(m.categoryId) || 0;
        spendingMap.set(m.categoryId, cur + m.amount);
      }
    });

    return budgetLimits
      .filter((bl) => bl.monthlyLimit > 0)
      .slice(0, 4)
      .map((bl) => {
        const cat = categoryMap.get(bl.categoryId);
        const spent = spendingMap.get(bl.categoryId) || 0;
        const pct = Math.round((spent / bl.monthlyLimit) * 100);
        return {
          id: bl.categoryId,
          name: cat?.name || 'Categoría',
          limit: bl.monthlyLimit,
          spent,
          percentage: pct,
        };
      });
  }, [budgetLimits, recentMovements, categoryMap]);

  return (
    <div className="space-y-6">
      {/* 12-Column High Density Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Key Metrics + Recent Movements + Charts */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Top 3 High Density Metric Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white/50 p-4 border border-[#E4DAC0] rounded shadow-xs">
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider text-[#2C2C2C]">Ingresos</p>
              <p className="text-xl font-mono text-[#2E6F4E] font-bold mt-1">
                +{formatMXN(summary.totalIncome)}
              </p>
              <p className="text-[10px] font-mono text-[#8a8370] mt-1">HABER TOTAL</p>
            </div>

            <div className="bg-white/50 p-4 border border-[#E4DAC0] rounded shadow-xs">
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider text-[#2C2C2C]">Egresos</p>
              <p className="text-xl font-mono text-[#A33B2E] font-bold mt-1">
                -{formatMXN(summary.totalExpense)}
              </p>
              <p className="text-[10px] font-mono text-[#8a8370] mt-1">DEBE TOTAL</p>
            </div>

            <div className="bg-white/50 p-4 border border-[#E4DAC0] rounded shadow-xs relative">
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider text-[#2C2C2C]">Por Pagar (Fijos)</p>
              <p className="text-xl font-mono text-[#B8863A] font-bold mt-1">
                {formatMXN(summary.pendingFixedAmount)}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] font-mono text-[#8a8370]">{summary.pendingFixedCount} pendientes</p>
                {summary.pendingFixedAmount - summary.netBalance > 0 && (
                  <p className="text-[10px] font-mono text-[#A33B2E] bg-[#FDF7F7] px-1.5 py-0.5 rounded font-bold border border-[#A33B2E]/20" title="Dinero que te falta para cubrir los pagos pendientes con tu saldo actual">
                    Faltan: {formatMXN(summary.pendingFixedAmount - summary.netBalance)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Movements Table Card */}
          <div className="bg-white/40 border border-[#E4DAC0] p-5 sm:p-6 rounded relative shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-[#1F2A22] font-serif">
                <span className="w-2 h-2 rounded-full bg-[#1F2A22]" />
                Movimientos Recientes
              </h3>
              <button
                onClick={onNavigateToMovements}
                className="text-xs font-serif font-bold text-[#2E6F4E] hover:underline cursor-pointer"
              >
                Ver todos ({recentMovements.length}) &rarr;
              </button>
            </div>

            <div className="space-y-0 divide-y divide-[#E4DAC0]/50">
              {recentMovements.length > 0 ? (
                recentMovements.slice(0, 5).map((mov) => {
                  const isIncome = mov.type === 'income';
                  return (
                    <div
                      key={mov.id}
                      className="flex items-center justify-between py-2.5 text-sm hover:bg-[#FAF6EC]/80 transition-colors px-1 rounded-xs"
                    >
                      <span className="w-20 font-mono opacity-60 text-xs">
                        {formatDateShort(mov.date)}
                      </span>
                      <span className={`flex-1 truncate pr-2 font-medium ${isIncome ? 'text-[#2E6F4E]' : 'text-[#2C2724]'}`}>
                        {mov.description}
                      </span>
                      <span className="w-20 text-right italic text-xs opacity-60 hidden sm:inline">
                        {mov.paymentMethod === 'card' ? 'Tarjeta' : mov.paymentMethod === 'cash' ? 'Efectivo' : 'Transf'}
                      </span>
                      <span
                        className={`w-28 text-right font-mono font-bold ${
                          isIncome ? 'text-[#2E6F4E]' : 'text-[#A33B2E]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatMXN(mov.amount)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-[#8a8370] font-serif">
                  No hay movimientos registrados en este período.
                </div>
              )}
            </div>

            {/* In-Card Fast Add Button */}
            <div className="mt-4 pt-3 border-t border-[#E4DAC0]/70 flex justify-between items-center">
              <span className="text-[11px] font-mono text-[#8a8370]">Asientos contables ordenados cronológicamente</span>
              <button
                onClick={onOpenAddMovement}
                className="h-8 px-3 bg-[#1F2A22] hover:bg-[#2A392F] text-white text-xs font-serif font-bold rounded flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Registrar nuevo asiento"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Asiento</span>
              </button>
            </div>
          </div>

          {/* Budget Alerts Section if any */}
          {budgetAlerts.length > 0 && (
            <div className="bg-[#fffdf9] border-2 border-[#B8863A]/60 rounded p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4DAC0] mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#B8863A]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2A22]">
                    Alertas de Presupuesto ({budgetAlerts.length})
                  </h4>
                </div>
                <button
                  onClick={onNavigateToBudget}
                  className="text-xs font-serif text-[#2E6F4E] hover:underline font-bold cursor-pointer"
                >
                  Gestionar Partidas &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {budgetAlerts.map((alert) => (
                  <div
                    key={alert.categoryId}
                    className={`p-2.5 rounded border flex items-center justify-between text-xs font-mono ${
                      alert.isCritical
                        ? 'bg-[#FDF2F2] border-[#A33B2E]/40 text-[#A33B2E]'
                        : 'bg-[#FEF9E7] border-[#B8863A]/40 text-[#B8863A]'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-[#1F2A22] block font-serif">{alert.categoryName}</span>
                      <span className="text-[10px] opacity-80">
                        {formatMXN(alert.spent)} / {formatMXN(alert.limit)} ({alert.percentage}%)
                      </span>
                    </div>
                    <span className="font-bold">
                      {alert.isCritical ? 'EXCEDIDO' : `QUEDAN ${formatMXN(alert.limit - alert.spent)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts: Donut + Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chart 1: Donut */}
            <div className="bg-white/40 border border-[#E4DAC0] p-4 rounded shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4DAC0] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F2A22] font-serif flex items-center gap-1.5">
                  <PieIcon className="w-3.5 h-3.5 text-[#2E6F4E]" />
                  Distribución Egresos
                </span>
                <span className="text-[10px] font-mono text-[#8a8370]">
                  {formatMXN(summary.totalExpense)}
                </span>
              </div>

              {pieData.length > 0 ? (
                <div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#FAF6EC" strokeWidth={1.5} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-1 pt-2 border-t border-[#E4DAC0]/70 text-[10px]">
                    {categoryExpenses.slice(0, 4).map((item) => (
                      <div key={item.category.id} className="flex items-center justify-between truncate pr-1">
                        <span className="truncate opacity-80">{item.category.name}</span>
                        <span className="font-mono font-bold text-[#1F2A22]">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-44 flex items-center justify-center text-xs text-[#8a8370] font-serif">
                  Sin egresos registrados
                </div>
              )}
            </div>

            {/* Chart 2: Bar Comparison */}
            <div className="bg-white/40 border border-[#E4DAC0] p-4 rounded shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4DAC0] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F2A22] font-serif flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-[#2E6F4E]" />
                  Mes vs. Anterior
                </span>
                <span className="text-[10px] font-mono text-[#8a8370]">Flujo</span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#E4DAC0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#736B5E"
                      tick={{ fontFamily: 'Fraunces', fontSize: 10, fill: '#1F2A22' }}
                    />
                    <YAxis
                      stroke="#736B5E"
                      tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: '#736B5E' }}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Ingresos" fill="#2E6F4E" radius={[2, 2, 0, 0]} barSize={20} />
                    <Bar dataKey="Egresos" fill="#A33B2E" radius={[2, 2, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-2 border-t border-[#E4DAC0]/70 flex justify-between text-[10px] font-mono text-[#8a8370]">
                <span>Ingresos vs Egresos</span>
                <button
                  onClick={onNavigateToMovements}
                  className="text-[#2E6F4E] font-bold hover:underline font-serif cursor-pointer"
                >
                  Detalles &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Pagos Fijos + Presupuesto */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Pagos Fijos Card */}
          <div className="bg-[#fffdf9] border-2 border-[#E4DAC0] p-5 rounded relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F2A22] font-serif">
                Pagos Fijos
              </h3>
              <button
                onClick={onNavigateToFixedPayments}
                className="text-xs font-serif font-bold text-[#2E6F4E] hover:underline cursor-pointer"
              >
                Ver todos ({fixedPayments.length}) &rarr;
              </button>
            </div>

            <div className="space-y-3.5 relative">
              {fixedPayments.slice(0, 4).map((fp) => {
                const isPaid = !!monthStatus[fp.id]?.isPaid;
                const status = calculateDueStatus(fp.dueDay, summary.year, summary.month);

                return (
                  <div key={fp.id} className="relative">
                    <div
                      className={`flex items-start gap-3 transition-opacity ${
                        isPaid ? 'opacity-40' : 'opacity-100'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onToggleFixedPaid && onToggleFixedPaid(fp.id, isPaid)}
                        className="w-4 h-4 border-2 border-[#1F2A22] mt-0.5 flex items-center justify-center text-[10px] font-bold rounded-xs cursor-pointer hover:bg-[#FAF6EC]"
                        title={isPaid ? 'Marcar como pendiente' : 'Marcar como pagado'}
                      >
                        {isPaid ? '✓' : ''}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold leading-tight truncate text-[#1F2A22] font-serif">
                          {fp.name}
                        </p>
                        <p className="text-[10px] font-mono opacity-80">
                          {formatMXN(fp.amount)} - Día {String(fp.dueDay).padStart(2, '0')}
                        </p>
                      </div>

                      {!isPaid && (
                        <span
                          className={`text-[9px] font-mono font-bold flex-shrink-0 ${
                            status.status === 'overdue'
                              ? 'text-[#A33B2E]'
                              : status.status === 'today'
                              ? 'text-[#A33B2E] animate-pulse'
                              : 'text-[#B8863A]'
                          }`}
                        >
                          {status.label}
                        </span>
                      )}
                    </div>

                    {isPaid && (
                      <div className="absolute top-0 right-0 border-2 border-[#A33B2E] rounded px-1.5 py-0.2 text-[#A33B2E] font-mono font-black text-[9px] transform rotate-6 opacity-90 pointer-events-none select-none">
                        PAGADO
                      </div>
                    )}
                  </div>
                );
              })}

              {fixedPayments.length === 0 && (
                <div className="py-4 text-center text-xs text-[#8a8370] font-serif">
                  No hay pagos fijos configurados.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#E4DAC0] flex justify-between items-center text-[10px] font-mono text-[#8a8370]">
              <span>{summary.paidFixedCount} de {fixedPayments.length} cubiertos</span>
              <button
                onClick={onNavigateToFixedPayments}
                className="text-[#2E6F4E] font-bold hover:underline font-serif cursor-pointer"
              >
                Administrar &rarr;
              </button>
            </div>
          </div>

          {/* Presupuesto Card */}
          <div className="bg-[#fffdf9] border border-[#E4DAC0] p-5 rounded shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1F2A22] font-serif">
                Presupuesto
              </h3>
              <button
                onClick={onNavigateToBudget}
                className="text-xs font-serif font-bold text-[#2E6F4E] hover:underline cursor-pointer"
              >
                Ajustar &rarr;
              </button>
            </div>

            <div className="space-y-4">
              {budgetPreview.length > 0 ? (
                budgetPreview.map((item) => {
                  const isOver = item.percentage >= 100;
                  const isNear = item.percentage >= 80 && !isOver;
                  const fillColor = isOver ? 'bg-[#A33B2E]' : isNear ? 'bg-[#B8863A]' : 'bg-[#2E6F4E]';

                  return (
                    <div key={item.id}>
                      <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-wider">
                        <span className="truncate pr-1 text-[#1F2A22]">{item.name}</span>
                        <span className={`font-mono ${isOver ? 'text-[#A33B2E]' : isNear ? 'text-[#B8863A]' : 'text-[#2E6F4E]'}`}>
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E4DAC0] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${fillColor}`}
                          style={{ width: `${Math.min(100, item.percentage)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono mt-1 opacity-70">
                        {isOver ? (
                          <span className="text-[#A33B2E] font-bold">
                            EXCEDIDO {formatMXN(item.spent - item.limit)}
                          </span>
                        ) : (
                          <span>
                            {formatMXN(item.spent)} / {formatMXN(item.limit)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-xs text-[#8a8370] font-serif">
                  Sin límites de presupuesto configurados.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#E4DAC0] flex justify-between items-center text-[10px] font-mono text-[#8a8370]">
              <span>Control mensual por partida</span>
              <button
                onClick={onNavigateToBudget}
                className="text-[#2E6F4E] font-bold hover:underline font-serif cursor-pointer"
              >
                Ver límites &rarr;
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

