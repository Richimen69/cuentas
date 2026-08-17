import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Plus,
  Edit3,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Info,
  Sliders,
  Save,
  X
} from 'lucide-react';
import { Category, BudgetLimit, Movement } from '../types';
import { formatMXN } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface BudgetViewProps {
  categories: Category[];
  budgetLimits: BudgetLimit[];
  movements: Movement[];
  onUpdateBudgetLimit: (categoryId: string, newLimit: number) => void;
  onOpenAddCategoryModal: () => void;
  selectedMonthName: string;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  categories,
  budgetLimits,
  movements,
  onUpdateBudgetLimit,
  onOpenAddCategoryModal,
  selectedMonthName,
}) => {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [tempLimitValue, setTempLimitValue] = useState<string>('');

  // Filter only expense categories
  const expenseCategories = useMemo(() => {
    return categories.filter((c) => c.type === 'expense');
  }, [categories]);

  // Calculate actual spending per category in current month
  const categorySpendingMap = useMemo(() => {
    const map = new Map<string, number>();
    movements.forEach((m) => {
      if (m.type === 'expense') {
        const current = map.get(m.categoryId) || 0;
        map.set(m.categoryId, current + m.amount);
      }
    });
    return map;
  }, [movements]);

  // Map limits
  const budgetLimitsMap = useMemo(() => {
    const map = new Map<string, number>();
    budgetLimits.forEach((b) => map.set(b.categoryId, b.monthlyLimit));
    return map;
  }, [budgetLimits]);

  // Overall budget summary
  const { totalBudgeted, totalSpentBudgeted, overallPercentage } = useMemo(() => {
    let budgeted = 0;
    let spent = 0;

    expenseCategories.forEach((cat) => {
      const limit = budgetLimitsMap.get(cat.id) || 0;
      const catSpent = categorySpendingMap.get(cat.id) || 0;
      budgeted += limit;
      spent += catSpent;
    });

    const pct = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
    return { totalBudgeted: budgeted, totalSpentBudgeted: spent, overallPercentage: pct };
  }, [expenseCategories, budgetLimitsMap, categorySpendingMap]);

  const handleStartEdit = (categoryId: string, currentLimit: number) => {
    setEditingCategoryId(categoryId);
    setTempLimitValue(currentLimit.toString());
  };

  const handleSaveEdit = (categoryId: string) => {
    const val = parseFloat(tempLimitValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudgetLimit(categoryId, val);
    }
    setEditingCategoryId(null);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Global Budget Header */}
      <div className="bg-[#FAF6EC] border-2 border-[#C4B99F] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E4DAC0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#8C826F] font-bold">
                Control Presupuestario • {selectedMonthName}
              </span>
            </div>
            <h3 className="font-serif font-bold text-xl text-[#1F2A22] mt-0.5">
              Presupuesto Mensual por Categoría
            </h3>
            <p className="text-xs text-[#736B5E] font-sans mt-0.5">
              Establece topes máximos de gasto para evitar excesos y proteger tu capacidad de ahorro.
            </p>
          </div>

          <button
            onClick={onOpenAddCategoryModal}
            className="px-3.5 py-2 bg-[#2E6F4E] hover:bg-[#23583E] text-white text-xs sm:text-sm font-serif font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Categoría de Gasto</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#736B5E]">Ejecución Total del Presupuesto:</span>
              <span className="font-bold text-[#1F2A22]">
                {formatMXN(totalSpentBudgeted)} de {formatMXN(totalBudgeted)} ({overallPercentage}%)
              </span>
            </div>
            
            {/* Multi-tier Progress Bar */}
            <div className="w-full h-3.5 bg-[#EAE3D2] rounded-full overflow-hidden p-0.5 border border-[#D9CEB4]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPercentage >= 100
                    ? 'bg-[#A33B2E]'
                    : overallPercentage >= 80
                    ? 'bg-[#B8863A]'
                    : 'bg-[#2E6F4E]'
                }`}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8C826F] font-mono">
              <span>0%</span>
              <span>80% (Alerta)</span>
              <span>100% (Límite)</span>
            </div>
          </div>

          <div className="bg-[#F5EFE1] p-3 rounded-lg border border-[#D9CEB4] flex flex-col justify-center">
            <div className="text-[10px] font-mono uppercase text-[#8C826F]">Remanente Presupuestal</div>
            <div
              className={`font-mono text-lg font-bold ${
                totalBudgeted - totalSpentBudgeted >= 0 ? 'text-[#2E6F4E]' : 'text-[#A33B2E]'
              }`}
            >
              {formatMXN(totalBudgeted - totalSpentBudgeted)}
            </div>
            <div className="text-[10px] text-[#736B5E] font-sans">
              {totalBudgeted - totalSpentBudgeted >= 0 ? 'Disponible para gastar' : 'Presupuesto sobregirado'}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Progress Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {expenseCategories.map((cat) => {
          const limit = budgetLimitsMap.get(cat.id) || 0;
          const spent = categorySpendingMap.get(cat.id) || 0;
          const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
          const isEditing = editingCategoryId === cat.id;

          const isOverLimit = percentage >= 100;
          const isNearLimit = percentage >= 80 && percentage < 100;
          const isGood = percentage < 80;

          const barColor = isOverLimit
            ? 'bg-[#A33B2E]'
            : isNearLimit
            ? 'bg-[#B8863A]'
            : 'bg-[#2E6F4E]';

          return (
            <div
              key={cat.id}
              className={`bg-[#FAF6EC] border-2 rounded-xl p-4 sm:p-5 shadow-sm transition-all relative ${
                isOverLimit
                  ? 'border-[#A33B2E]/60 bg-[#FDF7F7]'
                  : isNearLimit
                  ? 'border-[#B8863A]/60 bg-[#FEFCF5]'
                  : 'border-[#C4B99F]'
              }`}
            >
              {/* Card Header: Category Name, Icon and Edit Action */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2 rounded-lg text-white"
                    style={{ backgroundColor: cat.color || '#8B5A2B' }}
                  >
                    <CategoryIcon name={cat.iconName} className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm sm:text-base text-[#1F2A22]">
                      {cat.name}
                    </h4>
                    <span className="text-[11px] font-mono text-[#8C826F]">
                      {spent > 0 ? `${formatMXN(spent)} gastados` : 'Sin gastos aún'}
                    </span>
                  </div>
                </div>

                {/* Percentage Badge */}
                <div className="text-right">
                  <span
                    className={`inline-block text-xs font-mono font-black px-2 py-0.5 rounded ${
                      isOverLimit
                        ? 'bg-[#A33B2E] text-white'
                        : isNearLimit
                        ? 'bg-[#B8863A] text-white'
                        : 'bg-[#2E6F4E]/15 text-[#2E6F4E]'
                    }`}
                  >
                    {limit > 0 ? `${percentage}%` : 'Sin Límite'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3.5 space-y-1.5">
                <div className="w-full h-2.5 bg-[#EAE3D2] rounded-full overflow-hidden border border-[#D9CEB4]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#736B5E]">
                    Gastado: <strong className="text-[#1F2A22]">{formatMXN(spent)}</strong>
                  </span>
                  <span className="text-[#736B5E]">
                    Límite: <strong className="text-[#1F2A22]">{formatMXN(limit)}</strong>
                  </span>
                </div>
              </div>

              {/* Edit Limit Section */}
              <div className="mt-3 pt-3 border-t border-[#E4DAC0] flex items-center justify-between">
                {isEditing ? (
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs font-mono text-[#736B5E]">$</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={tempLimitValue}
                      onChange={(e) => setTempLimitValue(e.target.value)}
                      className="w-28 px-2 py-1 bg-white border border-[#2E6F4E] rounded text-xs font-mono font-bold focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(cat.id)}
                      className="p-1 bg-[#2E6F4E] text-white rounded hover:bg-[#23583E] cursor-pointer"
                      title="Guardar nuevo límite"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 bg-[#E4DAC0] text-[#595246] rounded hover:bg-[#D9CEB4] cursor-pointer"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-sans">
                      {isOverLimit ? (
                        <span className="text-[#A33B2E] font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Excedido por {formatMXN(spent - limit)}
                        </span>
                      ) : isNearLimit ? (
                        <span className="text-[#B8863A] font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Quedan {formatMXN(limit - spent)}
                        </span>
                      ) : (
                        <span className="text-[#2E6F4E] font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Disponible {formatMXN(limit - spent)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat.id, limit)}
                      className="text-xs font-serif text-[#736B5E] hover:text-[#1F2A22] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Editar Límite</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide Note */}
      <div className="bg-[#EFE9D9] border border-[#D9CEB4] rounded-xl p-4 flex items-center gap-3 text-xs text-[#595246]">
        <Info className="w-5 h-5 text-[#2E6F4E] flex-shrink-0" />
        <div>
          <strong>Regla de Semáforo:</strong> Las categorías menores al 80% aparecen en <span className="text-[#2E6F4E] font-bold">Verde</span>. Entre 80% y 99% entran en advertencia <span className="text-[#B8863A] font-bold">Ámbar</span>. Si superan el 100%, se marcan en <span className="text-[#A33B2E] font-bold">Rojo Crítico</span> y detonan una alerta contable en el panel de control.
        </div>
      </div>
    </div>
  );
};
