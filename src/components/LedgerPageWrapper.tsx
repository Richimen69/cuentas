import React from 'react';

interface LedgerPageWrapperProps {
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
  folioNumber?: string;
  actions?: React.ReactNode;
  selectedYear?: number;
  selectedMonth?: number;
}

export const LedgerPageWrapper: React.FC<LedgerPageWrapperProps> = ({
  children,
  pageTitle,
  pageSubtitle,
  folioNumber = 'LIB-2026-08',
  actions,
  selectedYear = 2026,
  selectedMonth = 7,
}) => {
  return (
    <div className="flex-1 flex flex-col z-10">
      {/* Subheader bar with folio, title and quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#E4DAC0]/70 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1F2A22]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1F2A22] font-serif">
            {pageTitle}
          </h2>
          {pageSubtitle && (
            <span className="text-xs text-[#8a8370] hidden lg:inline font-sans font-normal">
              — {pageSubtitle}
            </span>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
            {actions}
          </div>
        )}
      </div>

      {/* Main View Body */}
      <div className="flex-1">
        {children}
      </div>

      {/* High Density Ledger Footer */}
      <footer className="mt-6 pt-3 border-t border-[#E4DAC0] flex flex-wrap justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-50 italic text-[#2C2C2C] gap-2 select-none font-mono">
        <span>ID Libro: LIB-{selectedYear}-{String(selectedMonth + 1).padStart(2, '0')}</span>
        <span className="hidden sm:inline">Folio de Control: {folioNumber}</span>
        <span>Sistema de Partida Doble • MXN</span>
      </footer>
    </div>
  );
};

