import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_BUDGET_LIMITS,
  DEFAULT_FIXED_PAYMENTS,
  SAMPLE_MOVEMENTS,
  INITIAL_FIXED_PAYMENTS_STATUS
} from './data/initialData';
import {
  Movement,
  Category,
  FixedPayment,
  BudgetLimit,
  ActiveTab,
  MonthSummary,
  BudgetAlert,
  TransactionType,
  PaymentMethod,
  FixedPaymentMonthRecord
} from './types';
import {
  getMonthKey,
  MONTH_NAMES_ES,
  formatMXN,
  getTodayDateString
} from './utils/formatters';
import {
  fetchServerState,
  apiAddMovement,
  apiDeleteMovement,
  apiAddFixedPayment,
  apiDeleteFixedPayment,
  apiToggleFixedPaymentStatus,
  apiAddCategory,
  apiUpdateBudgetLimit,
  apiResetDatabase,
  apiImportBackup,
} from './services/apiService';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { LedgerPageWrapper } from './components/LedgerPageWrapper';
import { DashboardView } from './components/DashboardView';
import { MovementsView } from './components/MovementsView';
import { FixedPaymentsView } from './components/FixedPaymentsView';
import { BudgetView } from './components/BudgetView';
import { AddMovementModal } from './components/AddMovementModal';
import { AddFixedPaymentModal } from './components/AddFixedPaymentModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { Plus, RotateCcw, Download, Upload, Database, CheckCircle2 } from 'lucide-react';

const STORAGE_KEYS = {
  MOVEMENTS: 'mi_libro_cuentas_movements_v1',
  CATEGORIES: 'mi_libro_cuentas_categories_v1',
  BUDGETS: 'mi_libro_cuentas_budgets_v1',
  FIXED_PAYMENTS: 'mi_libro_cuentas_fixed_payments_v1',
  FIXED_STATUS: 'mi_libro_cuentas_fixed_status_v1',
};

export default function App() {
  // Current real date
  const now = new Date();
  const currentRealYear = now.getFullYear();
  const currentRealMonth = now.getMonth();

  // Selected date context for ledger book
  const [selectedYear, setSelectedYear] = useState<number>(currentRealYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentRealMonth);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);

  // Modals state
  const [isAddMovementOpen, setIsAddMovementOpen] = useState(false);
  const [isAddFixedPaymentOpen, setIsAddFixedPaymentOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  // Persistent States
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [movements, setMovements] = useState<Movement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      const initialList: Movement[] = saved ? JSON.parse(saved) : SAMPLE_MOVEMENTS;
      const uniqueMap = new Map<string, Movement>();
      initialList.forEach((m) => {
        if (m && m.id) uniqueMap.set(m.id, m);
      });
      return Array.from(uniqueMap.values());
    } catch {
      return SAMPLE_MOVEMENTS;
    }
  });

  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return saved ? JSON.parse(saved) : DEFAULT_BUDGET_LIMITS;
    } catch {
      return DEFAULT_BUDGET_LIMITS;
    }
  });

  const [fixedPayments, setFixedPayments] = useState<FixedPayment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FIXED_PAYMENTS);
      return saved ? JSON.parse(saved) : DEFAULT_FIXED_PAYMENTS;
    } catch {
      return DEFAULT_FIXED_PAYMENTS;
    }
  });

  const [fixedStatusByMonth, setFixedStatusByMonth] = useState<
    Record<string, Record<string, FixedPaymentMonthRecord>>
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FIXED_STATUS);
      return saved ? JSON.parse(saved) : INITIAL_FIXED_PAYMENTS_STATUS;
    } catch {
      return INITIAL_FIXED_PAYMENTS_STATUS;
    }
  });

  // Initial load from PostgreSQL / Cloud SQL backend
  useEffect(() => {
    async function loadDataFromDb() {
      const serverState = await fetchServerState();
      if (serverState) {
        setIsDbConnected(true);
        if (serverState.categories?.length > 0) setCategories(serverState.categories);
        if (serverState.movements?.length > 0) {
          // Deduplicate movements by ID to prevent duplicate key warnings
          const uniqueMovementsMap = new Map<string, Movement>();
          serverState.movements.forEach((m) => {
            if (m && m.id) {
              uniqueMovementsMap.set(m.id, m);
            }
          });
          setMovements(Array.from(uniqueMovementsMap.values()));
        }
        if (serverState.budgetLimits?.length > 0) setBudgetLimits(serverState.budgetLimits);
        if (serverState.fixedPayments?.length > 0) setFixedPayments(serverState.fixedPayments);
        if (serverState.fixedPaymentMonthStatus) setFixedStatusByMonth(serverState.fixedPaymentMonthStatus);
      } else {
        setIsDbConnected(false);
      }
    }
    loadDataFromDb();
  }, []);

  // Save to LocalStorage whenever states update (offline cache)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgetLimits));
  }, [budgetLimits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FIXED_PAYMENTS, JSON.stringify(fixedPayments));
  }, [fixedPayments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FIXED_STATUS, JSON.stringify(fixedStatusByMonth));
  }, [fixedStatusByMonth]);

  // Current Month Key (e.g. "2026-08")
  const currentMonthKey = useMemo(() => {
    return getMonthKey(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Previous Month Key
  const previousMonthKey = useMemo(() => {
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    return getMonthKey(prevYear, prevMonth);
  }, [selectedYear, selectedMonth]);

  // Current month's movements
  const currentMonthMovements = useMemo(() => {
    return movements.filter((m) => m.date.startsWith(currentMonthKey));
  }, [movements, currentMonthKey]);

  // Previous month's movements
  const previousMonthMovements = useMemo(() => {
    return movements.filter((m) => m.date.startsWith(previousMonthKey));
  }, [movements, previousMonthKey]);

  // Status of fixed payments for selected month
  const currentMonthFixedStatus = useMemo(() => {
    return fixedStatusByMonth[currentMonthKey] || {};
  }, [fixedStatusByMonth, currentMonthKey]);

  // Financial summary of selected month
  const summary: MonthSummary = useMemo(() => {
    let income = 0;
    let expense = 0;

    currentMonthMovements.forEach((m) => {
      if (m.type === 'income') income += m.amount;
      else expense += m.amount;
    });

    let prevIncome = 0;
    let prevExpense = 0;
    previousMonthMovements.forEach((m) => {
      if (m.type === 'income') prevIncome += m.amount;
      else prevExpense += m.amount;
    });

    let totalFixed = 0;
    let paidFixed = 0;
    let pendingFixed = 0;
    let paidCount = 0;
    let pendingCount = 0;

    fixedPayments.forEach((fp) => {
      totalFixed += fp.amount;
      const isPaid = currentMonthFixedStatus[fp.id]?.isPaid;
      if (isPaid) {
        paidFixed += fp.amount;
        paidCount++;
      } else {
        pendingFixed += fp.amount;
        pendingCount++;
      }
    });

    return {
      year: selectedYear,
      month: selectedMonth,
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
      previousMonthIncome: prevIncome,
      previousMonthExpense: prevExpense,
      totalFixedAmount: totalFixed,
      paidFixedAmount: paidFixed,
      pendingFixedAmount: pendingFixed,
      paidFixedCount: paidCount,
      pendingFixedCount: pendingCount,
    };
  }, [
    selectedYear,
    selectedMonth,
    currentMonthMovements,
    previousMonthMovements,
    fixedPayments,
    currentMonthFixedStatus,
  ]);

  // Category Expenses Breakdown for Donut Chart
  const categoryExpenses = useMemo(() => {
    const map = new Map<string, number>();
    currentMonthMovements.forEach((m) => {
      if (m.type === 'expense') {
        const cur = map.get(m.categoryId) || 0;
        map.set(m.categoryId, cur + m.amount);
      }
    });

    const categoryMap = new Map<string, Category>();
    categories.forEach((c) => categoryMap.set(c.id, c));

    const totalExp = summary.totalExpense > 0 ? summary.totalExpense : 1;

    const list = Array.from(map.entries()).map(([catId, amount]) => {
      const cat = categoryMap.get(catId) || {
        id: catId,
        name: 'Sin Categoría',
        type: 'expense' as TransactionType,
        iconName: 'Tag',
        color: '#8C826F',
      };
      return {
        category: cat,
        amount,
        percentage: Math.round((amount / totalExp) * 100),
      };
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [currentMonthMovements, categories, summary.totalExpense]);

  // Budget Alerts Calculation (>=80% warning, >=100% critical)
  const budgetAlerts: BudgetAlert[] = useMemo(() => {
    const spendingMap = new Map<string, number>();
    currentMonthMovements.forEach((m) => {
      if (m.type === 'expense') {
        const cur = spendingMap.get(m.categoryId) || 0;
        spendingMap.set(m.categoryId, cur + m.amount);
      }
    });

    const categoryMap = new Map<string, Category>();
    categories.forEach((c) => categoryMap.set(c.id, c));

    const alerts: BudgetAlert[] = [];

    budgetLimits.forEach((limitObj) => {
      const cat = categoryMap.get(limitObj.categoryId);
      if (!cat || cat.type !== 'expense' || limitObj.monthlyLimit <= 0) return;

      const spent = spendingMap.get(limitObj.categoryId) || 0;
      const pct = Math.round((spent / limitObj.monthlyLimit) * 100);

      if (pct >= 80) {
        alerts.push({
          categoryId: limitObj.categoryId,
          categoryName: cat.name,
          spent,
          limit: limitObj.monthlyLimit,
          percentage: pct,
          isCritical: pct >= 100,
          isWarning: pct >= 80 && pct < 100,
        });
      }
    });

    return alerts.sort((a, b) => b.percentage - a.percentage);
  }, [currentMonthMovements, categories, budgetLimits]);

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedYear((y) => y - 1);
      setSelectedMonth(11);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedYear((y) => y + 1);
      setSelectedMonth(0);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleSelectCurrentMonth = () => {
    setSelectedYear(currentRealYear);
    setSelectedMonth(currentRealMonth);
  };

  // Add Movement Handler
  const handleAddMovement = async (data: {
    type: TransactionType;
    amount: number;
    date: string;
    categoryId: string;
    description: string;
    paymentMethod: PaymentMethod;
  }) => {
    const newMovement: Movement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...data,
      createdAt: Date.now(),
    };
    setMovements((prev) => [newMovement, ...prev]);
    await apiAddMovement(newMovement);
  };

  // Delete Movement Handler
  const handleDeleteMovement = async (id: string) => {
    setMovements((prev) => prev.filter((m) => m.id !== id));
    await apiDeleteMovement(id);
  };

  // Toggle Fixed Payment Paid Status
  const handleToggleFixedPaid = async (fixedPaymentId: string, isPaid: boolean) => {
    const todayStr = getTodayDateString();
    let newMovementToPersist: Movement | null = null;
    let movIdToDelete: string | undefined;

    setFixedStatusByMonth((prev) => {
      const monthRecords = { ...(prev[currentMonthKey] || {}) };
      const currentRecord = monthRecords[fixedPaymentId] || { isPaid: false };

      if (isPaid) {
        const fp = fixedPayments.find((p) => p.id === fixedPaymentId);
        let createdMovId = currentRecord.movementId;

        if (fp && !createdMovId) {
          const newMovementId = `mov-fixed-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          const newMovement: Movement = {
            id: newMovementId,
            date: `${currentMonthKey}-${String(fp.dueDay).padStart(2, '0')}`,
            type: 'expense',
            amount: fp.amount,
            categoryId: fp.categoryId,
            description: `Pago ${fp.name} (Fijo)`,
            paymentMethod: 'transfer',
            createdAt: Date.now(),
            fixedPaymentId: fp.id,
          };
          newMovementToPersist = newMovement;
          setMovements((mPrev) => {
            const filtered = mPrev.filter((m) => m.id !== newMovementId);
            return [newMovement, ...filtered];
          });
          createdMovId = newMovementId;
        }

        monthRecords[fixedPaymentId] = {
          isPaid: true,
          paidDate: todayStr,
          movementId: createdMovId,
        };
      } else {
        movIdToDelete = currentRecord.movementId;
        if (movIdToDelete) {
          setMovements((mPrev) => mPrev.filter((m) => m.id !== movIdToDelete));
        }

        monthRecords[fixedPaymentId] = {
          isPaid: false,
          paidDate: undefined,
          movementId: undefined,
        };
      }

      return {
        ...prev,
        [currentMonthKey]: monthRecords,
      };
    });

    if (newMovementToPersist) {
      await apiAddMovement(newMovementToPersist);
    }
    if (movIdToDelete) {
      await apiDeleteMovement(movIdToDelete);
    }

    await apiToggleFixedPaymentStatus({
      year: selectedYear,
      month: selectedMonth,
      fixedPaymentId,
      isPaid,
      paidDate: isPaid ? todayStr : undefined,
      movementId: newMovementToPersist ? (newMovementToPersist as Movement).id : undefined,
    });
  };

  // Add Fixed Payment Handler
  const handleAddFixedPayment = async (data: {
    name: string;
    amount: number;
    dueDay: number;
    categoryId: string;
    notes?: string;
  }) => {
    const newFP: FixedPayment = {
      id: `fix-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...data,
    };
    setFixedPayments((prev) => [...prev, newFP]);
    await apiAddFixedPayment(newFP);
  };

  // Delete Fixed Payment Handler
  const handleDeleteFixedPayment = async (id: string) => {
    setFixedPayments((prev) => prev.filter((p) => p.id !== id));
    await apiDeleteFixedPayment(id);
  };

  // Update Category Budget Limit
  const handleUpdateBudgetLimit = async (categoryId: string, newLimit: number) => {
    setBudgetLimits((prev) => {
      const exists = prev.some((b) => b.categoryId === categoryId);
      if (exists) {
        return prev.map((b) => (b.categoryId === categoryId ? { ...b, monthlyLimit: newLimit } : b));
      } else {
        return [...prev, { categoryId, monthlyLimit: newLimit }];
      }
    });
    await apiUpdateBudgetLimit(categoryId, newLimit);
  };

  // Add Custom Category Handler
  const handleAddCategory = async (data: {
    name: string;
    type: TransactionType;
    iconName: string;
    color: string;
    initialLimit?: number;
  }) => {
    const newCatId = `cat-custom-${Date.now()}`;
    const newCategory: Category = {
      id: newCatId,
      name: data.name,
      type: data.type,
      iconName: data.iconName,
      color: data.color,
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCategory]);
    await apiAddCategory(newCategory);

    if (data.type === 'expense' && data.initialLimit && data.initialLimit > 0) {
      setBudgetLimits((prev) => [...prev, { categoryId: newCatId, monthlyLimit: data.initialLimit! }]);
      await apiUpdateBudgetLimit(newCatId, data.initialLimit);
    }
  };

  // Clear all data
  const handleClearData = async () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar completamente la base de datos? Esto eliminará todos los registros y categorías.')) {
      setCategories([]);
      setBudgetLimits([]);
      setFixedPayments([]);
      setMovements([]);
      setFixedStatusByMonth({});
      setSelectedYear(currentRealYear);
      setSelectedMonth(currentRealMonth);
      await apiResetDatabase();
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      categories,
      budgetLimits,
      fixedPayments,
      movements,
      fixedStatusByMonth,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Mi_Libro_de_Cuentas_Respaldo_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.categories && parsed.movements) {
          setCategories(parsed.categories);
          setMovements(parsed.movements);
          if (parsed.budgetLimits) setBudgetLimits(parsed.budgetLimits);
          if (parsed.fixedPayments) setFixedPayments(parsed.fixedPayments);
          if (parsed.fixedStatusByMonth) setFixedStatusByMonth(parsed.fixedStatusByMonth);
          
          await apiImportBackup(parsed);
          alert('¡Respaldo importado y guardado en la base de datos con éxito!');
        } else {
          alert('El archivo no contiene un formato de respaldo válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Page titles and subtitle for the ledger wrapper
  const folioString = `FOLIO ${String(selectedMonth + 1).padStart(2, '0')} • EJERCICIO ${selectedYear}`;
  const monthNameStr = MONTH_NAMES_ES[selectedMonth];

  return (
    <div className="min-h-screen bg-[#1F2A22] text-[#2C2C2C] flex justify-center p-2 sm:p-4 md:p-6 lg:p-8 font-sans">
      
      {/* High Density physical book ledger frame */}
      <div className="w-full max-w-7xl bg-[#FAF6EC] rounded-r-xl rounded-l-md shadow-2xl flex flex-col md:flex-row relative overflow-hidden border-l-[12px] md:border-l-[16px] border-[#161f19]">
        
        {/* Subtle lined notebook paper pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: 'linear-gradient(#FAF6EC 31px, #E4DAC0 31px, #E4DAC0 32px)',
            backgroundSize: '100% 32px',
          }}
        />

        {/* Vertical Spine Navigation on Desktop / Tabs on Mobile */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingFixedCount={summary.pendingFixedCount}
          alertCount={budgetAlerts.length}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 z-10 overflow-hidden relative">
          
          {/* High Density Header */}
          <Header
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onSelectCurrentMonth={handleSelectCurrentMonth}
            netBalance={summary.netBalance}
            totalIncome={summary.totalIncome}
            totalExpense={summary.totalExpense}
            pendingFixedAmount={summary.pendingFixedAmount}
            isDbConnected={isDbConnected}
            onResetData={handleClearData}
          />

          {/* Parchment Paper Inner Ledger Container */}
          <LedgerPageWrapper
            folioNumber={`FOLIO ${String(selectedMonth + 1).padStart(2, '0')} • ${selectedYear}`}
            pageTitle={
              activeTab === 'dashboard'
                ? `Resumen de Cuentas`
                : activeTab === 'movements'
                ? `Libro Diario de Asientos`
                : activeTab === 'fixed_payments'
                ? `Compromisos y Pagos Fijos`
                : `Presupuesto y Partidas`
            }
            pageSubtitle={`${monthNameStr} ${selectedYear}`}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            actions={
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearData}
                  title="Vaciar base de datos"
                  className="px-2.5 py-1 bg-white/60 hover:bg-white border border-[#C4B99F] text-[#595246] text-xs font-serif rounded flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Vaciar DB</span>
                </button>

                <button
                  onClick={handleExportBackup}
                  title="Descargar copia de seguridad en JSON"
                  className="px-2.5 py-1 bg-white/60 hover:bg-white border border-[#C4B99F] text-[#595246] text-xs font-serif rounded flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Respaldar</span>
                </button>

                <label
                  title="Importar copia de seguridad JSON"
                  className="px-2.5 py-1 bg-white/60 hover:bg-white border border-[#C4B99F] text-[#595246] text-xs font-serif rounded flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Restaurar</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            }
          >
            {/* Active View Switching */}
            {activeTab === 'dashboard' && (
              <DashboardView
                summary={summary}
                categoryExpenses={categoryExpenses}
                budgetAlerts={budgetAlerts}
                recentMovements={currentMonthMovements}
                fixedPayments={fixedPayments}
                monthStatus={currentMonthFixedStatus}
                categories={categories}
                budgetLimits={budgetLimits}
                onNavigateToMovements={() => setActiveTab('movements')}
                onNavigateToFixedPayments={() => setActiveTab('fixed_payments')}
                onNavigateToBudget={() => setActiveTab('budget')}
                onOpenAddMovement={() => setIsAddMovementOpen(true)}
                onToggleFixedPaid={handleToggleFixedPaid}
              />
            )}

            {activeTab === 'movements' && (
              <MovementsView
                movements={currentMonthMovements}
                categories={categories}
                onOpenAddModal={() => setIsAddMovementOpen(true)}
                onDeleteMovement={handleDeleteMovement}
                selectedMonthName={monthNameStr}
                selectedYear={selectedYear}
              />
            )}

            {activeTab === 'fixed_payments' && (
              <FixedPaymentsView
                fixedPayments={fixedPayments}
                categories={categories}
                monthStatus={currentMonthFixedStatus}
                onTogglePaid={handleToggleFixedPaid}
                onOpenAddModal={() => setIsAddFixedPaymentOpen(true)}
                onDeleteFixedPayment={handleDeleteFixedPayment}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
              />
            )}

            {activeTab === 'budget' && (
              <BudgetView
                categories={categories}
                budgetLimits={budgetLimits}
                movements={currentMonthMovements}
                onUpdateBudgetLimit={handleUpdateBudgetLimit}
                onOpenAddCategoryModal={() => setIsAddCategoryOpen(true)}
                selectedMonthName={monthNameStr}
              />
            )}
          </LedgerPageWrapper>
        </div>
      </div>

      {/* Floating Action Button for Mobile & Fast Entry */}
      <button
        onClick={() => setIsAddMovementOpen(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 bg-[#2E6F4E] hover:bg-[#23583E] text-white p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 font-serif font-bold transition-all transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-[#FAF6EC]/40"
        title="Registrar nuevo movimiento"
      >
        <Plus className="w-6 h-6" />
        <span className="hidden md:inline pr-1 text-sm">Nuevo Asiento</span>
      </button>

      {/* Modals */}
      <AddMovementModal
        isOpen={isAddMovementOpen}
        onClose={() => setIsAddMovementOpen(false)}
        onAddMovement={handleAddMovement}
        categories={categories}
        onOpenCreateCategory={() => setIsAddCategoryOpen(true)}
      />

      <AddFixedPaymentModal
        isOpen={isAddFixedPaymentOpen}
        onClose={() => setIsAddFixedPaymentOpen(false)}
        onAddFixedPayment={handleAddFixedPayment}
        categories={categories}
      />

      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
}
