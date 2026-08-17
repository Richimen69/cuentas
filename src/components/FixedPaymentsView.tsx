import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
  Trash2,
  Edit2,
  DollarSign,
  Calendar,
  Sparkles,
  Info,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FixedPayment, Category, FixedPaymentMonthRecord } from '../types';
import { formatMXN, calculateDueStatus, MONTH_NAMES_ES } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { StampBadge } from './StampBadge';

interface FixedPaymentsViewProps {
  fixedPayments: FixedPayment[];
  categories: Category[];
  monthStatus: Record<string, FixedPaymentMonthRecord>;
  onTogglePaid: (fixedPaymentId: string, isPaid: boolean) => void;
  onUpdateOverride: (fixedPaymentId: string, overrideAmount: number | null) => void;
  onOpenAddModal: () => void;
  onDeleteFixedPayment: (id: string) => void;
  selectedYear: number;
  selectedMonth: number;
}

export const FixedPaymentsView: React.FC<FixedPaymentsViewProps> = ({
  fixedPayments,
  categories,
  monthStatus,
  onTogglePaid,
  onUpdateOverride,
  onOpenAddModal,
  onDeleteFixedPayment,
  selectedYear,
  selectedMonth,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // Calculations for total amounts and pending
  const { totalFixed, totalPaid, totalPending, paidCount, pendingCount } = useMemo(() => {
    let total = 0;
    let paid = 0;
    let pCount = 0;
    let pdCount = 0;

    fixedPayments.forEach((item) => {
      total += item.amount;
      const isPaid = monthStatus[item.id]?.isPaid;
      if (isPaid) {
        paid += item.amount;
        pdCount++;
      } else {
        pCount++;
      }
    });

    return {
      totalFixed: total,
      totalPaid: paid,
      totalPending: total - paid,
      paidCount: pdCount,
      pendingCount: pCount,
    };
  }, [fixedPayments, monthStatus]);

  // Trigger rubber stamp audio/confetti feedback when user marks as paid
  const handleToggle = (id: string, currentlyPaid: boolean) => {
    if (!currentlyPaid) {
      // Trigger a light tactile confetti puff
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.6 },
        colors: ['#A33B2E', '#2E6F4E', '#D4AF37'],
      });
    }
    onTogglePaid(id, !currentlyPaid);
  };

  // Filtered list
  const filteredList = useMemo(() => {
    return fixedPayments
      .filter((item) => {
        const isPaid = !!monthStatus[item.id]?.isPaid;
        if (filter === 'pending') return !isPaid;
        if (filter === 'paid') return isPaid;
        return true;
      })
      .sort((a, b) => a.dueDay - b.dueDay);
  }, [fixedPayments, monthStatus, filter]);

  return (
    <div className="space-y-6">
      {/* Top Ledger Summary for Fixed Obligations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Obligaciones */}
        <div className="bg-[#FAF6EC] border-2 border-[#C4B99F] rounded-xl p-4 shadow-sm">
          <div className="text-xs font-mono uppercase tracking-wider text-[#736B5E] font-bold flex items-center justify-between">
            <span>Compromisos Totales</span>
            <span className="text-[10px] text-[#8C826F] font-mono">{fixedPayments.length} pagos</span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-mono font-black text-[#1F2A22]">
            {formatMXN(totalFixed)}
          </div>
          <div className="text-[11px] text-[#736B5E] font-sans mt-1">
            Presupuesto comprometido en {MONTH_NAMES_ES[selectedMonth]}
          </div>
        </div>

        {/* Total Ya Cubierto */}
        <div className="bg-[#FAF6EC] border-2 border-[#2E6F4E]/40 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-mono uppercase tracking-wider text-[#2E6F4E] font-bold flex items-center justify-between">
            <span>Total Cubierto (Pagado)</span>
            <span className="text-[10px] font-mono bg-[#2E6F4E]/10 px-2 py-0.5 rounded font-bold text-[#2E6F4E]">
              {paidCount} de {fixedPayments.length}
            </span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-mono font-black text-[#2E6F4E]">
            {formatMXN(totalPaid)}
          </div>
          <div className="text-[11px] text-[#736B5E] font-sans mt-1">
            {totalFixed > 0 ? `${Math.round((totalPaid / totalFixed) * 100)}% de los compromisos pagados` : '0%'}
          </div>
        </div>

        {/* Total Pendiente */}
        <div className={`bg-[#FAF6EC] border-2 ${pendingCount > 0 ? 'border-[#B8863A]' : 'border-[#2E6F4E]'} rounded-xl p-4 shadow-sm`}>
          <div className="text-xs font-mono uppercase tracking-wider text-[#B8863A] font-bold flex items-center justify-between">
            <span>Pendiente por Pagar</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${pendingCount > 0 ? 'bg-[#B8863A]/15 text-[#B8863A]' : 'bg-[#2E6F4E]/15 text-[#2E6F4E]'}`}>
              {pendingCount} pendientes
            </span>
          </div>
          <div className={`mt-2 text-xl sm:text-2xl font-mono font-black ${pendingCount > 0 ? 'text-[#B8863A]' : 'text-[#2E6F4E]'}`}>
            {formatMXN(totalPending)}
          </div>
          <div className="text-[11px] text-[#736B5E] font-sans mt-1">
            {pendingCount === 0 ? '¡Todo liquidado para este mes!' : 'Monto que debes reservar'}
          </div>
        </div>
      </div>

      {/* Action Bar & Filter Tabs */}
      <div className="bg-[#F5EFE1] border-2 border-[#D9CEB4] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
        
        {/* Filter buttons */}
        <div className="inline-flex bg-[#FAF6EC] border border-[#C4B99F] rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-serif rounded-md transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#1F2A22] text-[#FAF6EC] font-bold shadow-xs'
                : 'text-[#736B5E] hover:text-[#1F2A22]'
            }`}
          >
            Todos ({fixedPayments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-xs font-serif rounded-md transition-colors cursor-pointer ${
              filter === 'pending'
                ? 'bg-[#B8863A] text-white font-bold shadow-xs'
                : 'text-[#736B5E] hover:text-[#B8863A]'
            }`}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('paid')}
            className={`px-3 py-1.5 text-xs font-serif rounded-md transition-colors cursor-pointer ${
              filter === 'paid'
                ? 'bg-[#2E6F4E] text-white font-bold shadow-xs'
                : 'text-[#736B5E] hover:text-[#2E6F4E]'
            }`}
          >
            Pagados ({paidCount})
          </button>
        </div>

        {/* Primary Add Fixed Bill Button */}
        <button
          onClick={onOpenAddModal}
          className="px-3.5 py-2 bg-[#1F2A22] hover:bg-[#2A392F] text-[#FAF6EC] text-xs sm:text-sm font-serif font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Nuevo Pago Recurrente</span>
        </button>
      </div>

      {/* Cards List of Fixed Payments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.length > 0 ? (
          filteredList.map((item, index) => {
            const category = categoryMap.get(item.categoryId);
            const statusRecord = monthStatus[item.id] || { isPaid: false };
            const isPaid = statusRecord.isPaid;
            const dueStatus = calculateDueStatus(item.dueDay, selectedYear, selectedMonth);

            // Deterministic rotation angle for stamp between -10 and -14 deg for hand-stamped realism
            const stampAngle = -10 - ((index * 3) % 7);

            return (
              <div
                key={item.id}
                className={`relative bg-[#FAF6EC] border-2 rounded-xl p-5 shadow-sm transition-all overflow-hidden group ${
                  isPaid
                    ? 'border-[#2E6F4E]/40 bg-gradient-to-br from-[#FAF6EC] to-[#F2EFE4]'
                    : dueStatus.status === 'overdue'
                    ? 'border-[#A33B2E]/60 bg-[#FDF7F7]'
                    : dueStatus.status === 'today'
                    ? 'border-[#B8863A] bg-[#FEFDF7]'
                    : 'border-[#C4B99F]'
                }`}
              >
                {/* Visual Rubber Stamp "PAGADO" Overlay */}
                {isPaid && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-20 transition-all duration-300 transform group-hover:scale-105">
                    <StampBadge
                      text="PAGADO"
                      date={statusRecord.paidDate ? `FOLIO • ${statusRecord.paidDate}` : `${item.dueDay} ${MONTH_NAMES_ES[selectedMonth]}`}
                      size="md"
                      rotation={stampAngle}
                    />
                  </div>
                )}

                <div className="flex items-start justify-between gap-3 relative z-10">
                  {/* Checkbox trigger to mark paid */}
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id, isPaid)}
                      title={isPaid ? 'Marcar como pendiente' : 'Marcar como pagado'}
                      className={`mt-0.5 p-1 rounded-lg transition-transform active:scale-95 cursor-pointer ${
                        isPaid
                          ? 'text-[#2E6F4E] hover:text-[#1F2A22]'
                          : 'text-[#8C826F] hover:text-[#2E6F4E]'
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle className="w-6 h-6 fill-[#2E6F4E]/20 text-[#2E6F4E]" />
                      ) : (
                        <Circle className="w-6 h-6 stroke-[1.75]" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-serif font-bold text-base transition-colors ${
                            isPaid ? 'text-[#595246] line-through decoration-[#8C826F]/60' : 'text-[#1F2A22]'
                          }`}
                        >
                          {item.name}
                        </h4>
                      </div>

                      {/* Category Chip */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-xs text-[#736B5E] bg-[#EFE7D5] px-2 py-0.5 rounded-md font-sans">
                          <CategoryIcon name={category?.iconName || 'Tag'} size={12} />
                          {category?.name || 'General'}
                        </span>
                      </div>

                      {/* Notes / Description */}
                      {item.notes && (
                        <p className="text-xs text-[#8C826F] font-sans mt-1.5 italic">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Delete */}
                  <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Deseas eliminar el pago fijo recurrente "${item.name}"?`)) {
                          onDeleteFixedPayment(item.id);
                        }
                      }}
                      title="Eliminar pago fijo"
                      className="p-1 text-[#8C826F] hover:text-[#A33B2E] rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Amount & Due Day Status */}
                <div className="mt-4 pt-3 border-t border-[#E4DAC0] flex items-center justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#8C826F]" />
                    <span className="font-mono text-xs text-[#595246] font-medium">
                      Día {item.dueDay} de cada mes
                    </span>
                    {!isPaid && (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          dueStatus.status === 'overdue'
                            ? 'bg-[#A33B2E]/15 text-[#A33B2E]'
                            : dueStatus.status === 'today'
                            ? 'bg-[#B8863A]/20 text-[#B8863A] animate-pulse'
                            : 'bg-[#FAF6EC] border border-[#C4B99F] text-[#736B5E]'
                        }`}
                      >
                        {dueStatus.label}
                      </span>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div className="font-mono text-lg font-black text-[#1F2A22] flex items-center justify-end gap-1">
                      {formatMXN(statusRecord.overrideAmount !== undefined && statusRecord.overrideAmount !== null ? statusRecord.overrideAmount : item.amount)}
                      {!isPaid && (
                        <button
                          type="button"
                          onClick={() => {
                            const currentVal = statusRecord.overrideAmount !== undefined && statusRecord.overrideAmount !== null ? statusRecord.overrideAmount : item.amount;
                            const newValStr = window.prompt(`Ingresa el nuevo monto para este mes de ${item.name}:`, String(currentVal));
                            if (newValStr !== null) {
                              const newVal = parseFloat(newValStr);
                              if (!isNaN(newVal) && newVal >= 0) {
                                onUpdateOverride(item.id, newVal);
                              }
                            }
                          }}
                          title="Modificar monto solo para este mes"
                          className="text-[#8C826F] hover:text-[#1F2A22] p-1 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {statusRecord.overrideAmount !== undefined && statusRecord.overrideAmount !== null && (
                      <div className="flex justify-end items-center gap-1">
                        <span className="text-[10px] text-[#8C826F] line-through font-mono">Original: {formatMXN(item.amount)}</span>
                        {!isPaid && (
                          <button
                            type="button"
                            onClick={() => onUpdateOverride(item.id, null)}
                            title="Restablecer monto original"
                            className="text-[#8C826F] hover:text-[#A33B2E] p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Toggle Action Strip */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#8C826F]">
                    {isPaid ? '✓ Liquidado para este mes' : '○ Pendiente por pagar'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle(item.id, isPaid)}
                    className={`text-xs font-serif font-bold cursor-pointer transition-colors ${
                      isPaid
                        ? 'text-[#8C826F] hover:text-[#A33B2E] underline'
                        : 'text-[#2E6F4E] hover:underline flex items-center gap-1'
                    }`}
                  >
                    {isPaid ? 'Marcar como pendiente' : 'Aplicar sello de pagado →'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-[#8C826F] bg-[#FAF6EC] border-2 border-dashed border-[#C4B99F] rounded-xl p-8">
            <CalendarCheck className="w-12 h-12 stroke-[1.25] mx-auto text-[#C4B99F] mb-3" />
            <h4 className="font-serif font-bold text-base text-[#1F2A22]">
              No hay pagos fijos {filter !== 'all' ? `en estado "${filter}"` : 'registrados'}
            </h4>
            <p className="text-xs text-[#8C826F] mt-1 max-w-sm mx-auto">
              Registra tus suscripciones, renta, luz, internet o colegiaturas para no olvidar ningún vencimiento y llevar control estricto.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 bg-[#1F2A22] hover:bg-[#2A392F] text-[#FAF6EC] text-xs font-serif font-bold rounded-lg shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" /> Agregar Primer Pago Fijo
            </button>
          </div>
        )}
      </div>

      {/* Helpful Hint on Monthly Retention */}
      <div className="bg-[#EFE9D9] border border-[#D9CEB4] rounded-xl p-3.5 flex items-center gap-3 text-xs text-[#595246]">
        <Info className="w-4 h-4 text-[#2E6F4E] flex-shrink-0" />
        <span>
          <strong>Control por período mensual:</strong> El estado de cada pago se guarda de manera independiente para cada mes. Al cambiar de mes verás el historial exacto correspondiente.
        </span>
      </div>
    </div>
  );
};
