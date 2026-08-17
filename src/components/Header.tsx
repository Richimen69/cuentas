import React from 'react';
import { MONTH_NAMES_ES, formatMXN } from '../utils/formatters';

interface HeaderProps {
  selectedYear: number;
  selectedMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectCurrentMonth: () => void;
  netBalance: number;
  totalIncome: number;
  totalExpense: number;
  pendingFixedAmount: number;
  onResetData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedYear,
  selectedMonth,
  onPrevMonth,
  onNextMonth,
  onSelectCurrentMonth,
  netBalance,
}) => {
  const isPositive = netBalance >= 0;
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === selectedYear && today.getMonth() === selectedMonth;

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-2 border-[#1F2A22] pb-3 mb-6 gap-4 select-none">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif text-[#1F2A22] font-bold tracking-tight">
          Mi Libro de Cuentas
        </h1>
        <p className="text-xs uppercase tracking-widest font-bold opacity-60 text-[#2C2C2C] mt-0.5">
          Registro Contable Personal • Ejercicio {selectedYear}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6">
        {/* Month Selector */}
        <div className="flex items-center gap-2 sm:gap-3 text-sm font-bold">
          <button
            type="button"
            onClick={onPrevMonth}
            className="cursor-pointer text-[#8a8370] hover:text-[#1F2A22] px-1 py-0.5 text-base transition-colors"
            title="Mes anterior"
          >
            &larr;
          </button>
          
          <button
            type="button"
            onClick={onSelectCurrentMonth}
            className="text-sm sm:text-base uppercase tracking-tighter border-x border-[#E4DAC0] px-3 sm:px-4 font-serif font-bold text-[#1F2A22] hover:bg-[#EFE9D9]/50 transition-colors rounded-xs"
            title={!isCurrentMonth ? "Hacer clic para volver al mes actual" : "Mes en curso"}
          >
            {MONTH_NAMES_ES[selectedMonth]} {selectedYear}
          </button>

          <button
            type="button"
            onClick={onNextMonth}
            className="cursor-pointer text-[#8a8370] hover:text-[#1F2A22] px-1 py-0.5 text-base transition-colors"
            title="Mes siguiente"
          >
            &rarr;
          </button>
        </div>

        {/* Total Balance */}
        <div className="text-right pl-2 border-l border-[#E4DAC0] sm:border-l-0">
          <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider text-[#2C2C2C]">
            Balance Total
          </p>
          <p
            className={`text-xl sm:text-2xl font-mono font-bold tracking-tight ${
              isPositive ? 'text-[#2E6F4E]' : 'text-[#A33B2E]'
            }`}
          >
            {isPositive ? '+' : ''}{formatMXN(netBalance)}
          </p>
        </div>
      </div>
    </header>
  );
};

