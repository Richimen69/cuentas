import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  ArrowUpDown,
  Tag,
  CreditCard,
  Banknote,
  Receipt,
  Download,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Movement, Category, TransactionType, PaymentMethod } from '../types';
import { formatMXN, formatDateShort, getPaymentMethodLabel } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface MovementsViewProps {
  movements: Movement[];
  categories: Category[];
  onOpenAddModal: () => void;
  onDeleteMovement: (id: string) => void;
  selectedMonthName: string;
  selectedYear: number;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  movements,
  categories,
  onOpenAddModal,
  onDeleteMovement,
  selectedMonthName,
  selectedYear,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Category map for quick lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // Filtered and sorted movements
  const filteredMovements = useMemo(() => {
    return movements
      .filter((mov) => {
        // Search term filter
        if (searchTerm.trim() !== '') {
          const term = searchTerm.toLowerCase();
          const categoryName = categoryMap.get(mov.categoryId)?.name.toLowerCase() || '';
          const matchesDesc = mov.description.toLowerCase().includes(term);
          const matchesCat = categoryName.includes(term);
          const matchesAmount = mov.amount.toString().includes(term);
          if (!matchesDesc && !matchesCat && !matchesAmount) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && mov.type !== typeFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && mov.categoryId !== categoryFilter) {
          return false;
        }

        // Payment method filter
        if (paymentMethodFilter !== 'all' && mov.paymentMethod !== paymentMethodFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [movements, searchTerm, typeFilter, categoryFilter, paymentMethodFilter, sortOrder, categoryMap]);

  // Sum totals of filtered view
  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredMovements.forEach((m) => {
      if (m.type === 'income') income += m.amount;
      else expense += m.amount;
    });
    return { totalIncome: income, totalExpense: expense };
  }, [filteredMovements]);

  // Export CSV for convenience
  const handleExportCSV = () => {
    const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Método de Pago', 'Monto (MXN)'];
    const rows = filteredMovements.map((m) => [
      m.date,
      m.type === 'income' ? 'Ingreso' : 'Egreso',
      categoryMap.get(m.categoryId)?.name || 'Sin Categoría',
      `"${m.description.replace(/"/g, '""')}"`,
      getPaymentMethodLabel(m.paymentMethod),
      m.amount.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Libro_Cuentas_${selectedMonthName}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Controls Bar: Search & Filters */}
      <div className="bg-[#F5EFE1] border-2 border-[#D9CEB4] rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C826F]" />
            <input
              type="text"
              placeholder="Buscar por concepto, categoría o monto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF6EC] border border-[#C4B99F] rounded-lg text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2E6F4E] focus:border-[#2E6F4E] placeholder-[#A89E8C]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C826F] hover:text-[#1F2A22]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Quick Selector & Add Button */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="inline-flex bg-[#FAF6EC] border border-[#C4B99F] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1.5 text-xs font-serif rounded-md transition-colors cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-[#1F2A22] text-[#FAF6EC] font-bold shadow-xs'
                    : 'text-[#736B5E] hover:text-[#1F2A22]'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('expense')}
                className={`px-2.5 py-1.5 text-xs font-serif rounded-md transition-colors cursor-pointer ${
                  typeFilter === 'expense'
                    ? 'bg-[#A33B2E] text-white font-bold shadow-xs'
                    : 'text-[#736B5E] hover:text-[#A33B2E]'
                }`}
              >
                Egresos
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('income')}
                className={`px-2.5 py-1.5 text-xs font-serif rounded-md transition-colors cursor-pointer ${
                  typeFilter === 'income'
                    ? 'bg-[#2E6F4E] text-white font-bold shadow-xs'
                    : 'text-[#736B5E] hover:text-[#2E6F4E]'
                }`}
              >
                Ingresos
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              title="Exportar movimientos a Excel/CSV"
              className="px-2.5 py-2 bg-[#FAF6EC] hover:bg-[#EFE7D5] border border-[#C4B99F] text-[#595246] rounded-lg text-xs font-serif flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* New Movement Primary Button */}
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 bg-[#2E6F4E] hover:bg-[#23583E] text-white text-xs sm:text-sm font-serif font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5 cursor-pointer ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Movimiento</span>
            </button>
          </div>
        </div>

        {/* Detailed Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E4DAC0]/80 text-xs">
          
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[#8C826F] font-mono whitespace-nowrap">Categoría:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-[#FAF6EC] border border-[#C4B99F] rounded-md font-sans focus:outline-none focus:ring-1 focus:ring-[#2E6F4E] cursor-pointer"
            >
              <option value="all">Todas las categorías</option>
              <optgroup label="Egresos">
                {categories
                  .filter((c) => c.type === 'expense')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Ingresos">
                {categories
                  .filter((c) => c.type === 'income')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[#8C826F] font-mono whitespace-nowrap">Método:</span>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-[#FAF6EC] border border-[#C4B99F] rounded-md font-sans focus:outline-none focus:ring-1 focus:ring-[#2E6F4E] cursor-pointer"
            >
              <option value="all">Todos los métodos</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta de Débito/Crédito</option>
              <option value="transfer">Transferencia Bancaria</option>
              <option value="other">Otro</option>
            </select>
          </div>

          {/* Date Sort Toggle */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-2.5 py-1.5 bg-[#FAF6EC] border border-[#C4B99F] text-[#595246] hover:text-[#1F2A22] rounded-md flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Orden: {sortOrder === 'desc' ? 'Más recientes primero' : 'Más antiguos primero'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ledger Table Container */}
      <div className="bg-[#FAF6EC] border-2 border-[#C4B99F] rounded-xl overflow-hidden shadow-sm">
        
        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EFE7D5] border-b-2 border-[#C4B99F] font-mono text-[11px] text-[#595246] uppercase tracking-wider">
                <th className="py-3 px-3 sm:px-4 font-bold w-24">Fecha</th>
                <th className="py-3 px-3 sm:px-4 font-bold">Concepto / Detalle</th>
                <th className="py-3 px-2 sm:px-3 font-bold hidden md:table-cell">Categoría</th>
                <th className="py-3 px-2 sm:px-3 font-bold hidden lg:table-cell text-center">Método</th>
                <th className="py-3 px-3 sm:px-4 font-bold text-right text-[#A33B2E] w-32">Debe (Egreso)</th>
                <th className="py-3 px-3 sm:px-4 font-bold text-right text-[#2E6F4E] w-32">Haber (Ingreso)</th>
                <th className="py-3 px-2 sm:px-3 text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DAC0] text-xs sm:text-sm font-sans">
              {filteredMovements.length > 0 ? (
                filteredMovements.map((mov, index) => {
                  const category = categoryMap.get(mov.categoryId);
                  const isExpense = mov.type === 'expense';

                  return (
                    <tr
                      key={mov.id}
                      className="hover:bg-[#F3EBDA] transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-3 sm:px-4 font-mono text-xs text-[#736B5E] whitespace-nowrap">
                        {formatDateShort(mov.date)}
                      </td>

                      {/* Description & mobile category */}
                      <td className="py-3 px-3 sm:px-4 font-medium text-[#1F2A22]">
                        <div className="font-serif font-bold text-[#1F2A22]">
                          {mov.description}
                        </div>
                        {/* Mobile category chip */}
                        <div className="flex items-center gap-2 mt-0.5 md:hidden">
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#736B5E]">
                            <CategoryIcon name={category?.iconName || 'Tag'} size={12} />
                            {category?.name || 'General'}
                          </span>
                          <span className="text-[10px] text-[#A89E8C] font-mono">
                            • {getPaymentMethodLabel(mov.paymentMethod)}
                          </span>
                        </div>
                      </td>

                      {/* Category (Desktop) */}
                      <td className="py-3 px-2 sm:px-3 hidden md:table-cell text-xs text-[#595246]">
                        <div className="inline-flex items-center gap-1.5 bg-[#FAF6EC] border border-[#D9CEB4] px-2 py-0.5 rounded-md">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category?.color || '#2E6F4E' }}
                          />
                          <CategoryIcon name={category?.iconName || 'Tag'} size={13} />
                          <span className="truncate max-w-[130px]">{category?.name || 'Sin Categoría'}</span>
                        </div>
                      </td>

                      {/* Payment Method (Desktop) */}
                      <td className="py-3 px-2 sm:px-3 hidden lg:table-cell text-center text-xs font-mono text-[#736B5E]">
                        <span className="bg-[#EFE9D9] px-2 py-0.5 rounded text-[11px]">
                          {getPaymentMethodLabel(mov.paymentMethod)}
                        </span>
                      </td>

                      {/* Debe (Expense) */}
                      <td className="py-3 px-3 sm:px-4 text-right font-mono font-bold text-xs sm:text-sm text-[#A33B2E]">
                        {isExpense ? formatMXN(mov.amount) : '—'}
                      </td>

                      {/* Haber (Income) */}
                      <td className="py-3 px-3 sm:px-4 text-right font-mono font-bold text-xs sm:text-sm text-[#2E6F4E]">
                        {!isExpense ? formatMXN(mov.amount) : '—'}
                      </td>

                      {/* Delete action */}
                      <td className="py-3 px-2 sm:px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar el movimiento "${mov.description}"?`)) {
                              onDeleteMovement(mov.id);
                            }
                          }}
                          title="Eliminar asiento contable"
                          className="p-1 text-[#A89E8C] hover:text-[#A33B2E] hover:bg-[#FDF2F2] rounded transition-colors opacity-40 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C826F]">
                    <Receipt className="w-10 h-10 stroke-[1.25] mx-auto text-[#C4B99F] mb-2" />
                    <p className="font-serif font-bold text-sm text-[#1F2A22]">
                      No hay asientos contables registrados
                    </p>
                    <p className="text-xs text-[#8C826F] mt-1 max-w-sm mx-auto">
                      {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all'
                        ? 'No se encontraron movimientos con los filtros aplicados. Intenta restablecer los filtros.'
                        : 'Comienza a asentar tus gastos e ingresos para llevar tu balance al centavo.'}
                    </p>
                    <button
                      onClick={onOpenAddModal}
                      className="mt-3 px-3 py-1.5 bg-[#2E6F4E] hover:bg-[#23583E] text-white text-xs font-serif font-bold rounded-lg shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Registrar Asiento
                    </button>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Table Footer with Totals */}
            {filteredMovements.length > 0 && (
              <tfoot>
                <tr className="bg-[#EFE7D5] border-t-2 border-[#C4B99F] font-mono text-xs font-bold text-[#1F2A22]">
                  <td colSpan={2} className="py-3 px-3 sm:px-4">
                    TOTALES DEL PERÍODO ({filteredMovements.length} asientos)
                  </td>
                  <td className="hidden md:table-cell"></td>
                  <td className="hidden lg:table-cell"></td>
                  <td className="py-3 px-3 sm:px-4 text-right text-[#A33B2E] font-bold">
                    {formatMXN(totalExpense)}
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-right text-[#2E6F4E] font-bold">
                    {formatMXN(totalIncome)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
