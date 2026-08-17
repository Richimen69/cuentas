import React, { useState } from 'react';
import { X, Plus, Calendar, Tag, CreditCard, DollarSign, FileText, Check } from 'lucide-react';
import { Category, TransactionType, PaymentMethod } from '../types';
import { getTodayDateString } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface AddMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMovement: (data: {
    type: TransactionType;
    amount: number;
    date: string;
    categoryId: string;
    description: string;
    paymentMethod: PaymentMethod;
  }) => void;
  categories: Category[];
  onOpenCreateCategory: () => void;
}

export const AddMovementModal: React.FC<AddMovementModalProps> = ({
  isOpen,
  onClose,
  onAddMovement,
  categories,
  onOpenCreateCategory,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [categoryId, setCategoryId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  // Filter categories by selected type
  const availableCategories = categories.filter((c) => c.type === type);

  // Set default category if none selected
  const activeCategoryId = categoryId && availableCategories.some((c) => c.id === categoryId)
    ? categoryId
    : availableCategories[0]?.id || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a cero.');
      return;
    }
    if (!description.trim()) {
      setError('Por favor ingresa un concepto o descripción para el movimiento.');
      return;
    }
    if (!activeCategoryId) {
      setError('Por favor selecciona una categoría.');
      return;
    }

    onAddMovement({
      type,
      amount: numAmount,
      date,
      categoryId: activeCategoryId,
      description: description.trim(),
      paymentMethod,
    });

    // Reset form
    setAmount('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF6EC] border-4 border-[#1F2A22] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Ledger Receipt Header */}
        <div className="bg-[#1F2A22] text-[#FAF6EC] px-6 py-4 flex items-center justify-between border-b-2 border-[#141B16]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C4B99F]">
              Folio de Registro
            </span>
            <h3 className="font-serif font-bold text-lg text-[#FAF6EC]">
              Nuevo Asiento en el Libro
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#C4B99F] hover:text-[#FAF6EC] hover:bg-[#253329] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-[#FDF2F2] border border-[#A33B2E] text-[#A33B2E] text-xs font-sans rounded-lg">
              {error}
            </div>
          )}

          {/* Type Selector Tabs (Egreso / Ingreso) */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1.5">
              Naturaleza del Asiento
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#EFE7D5] p-1 rounded-xl border border-[#D9CEB4]">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategoryId('');
                }}
                className={`py-2 text-xs sm:text-sm font-serif font-bold rounded-lg transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-[#A33B2E] text-white shadow-sm'
                    : 'text-[#736B5E] hover:text-[#1F2A22]'
                }`}
              >
                Egreso (Cargo / Salida)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategoryId('');
                }}
                className={`py-2 text-xs sm:text-sm font-serif font-bold rounded-lg transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-[#2E6F4E] text-white shadow-sm'
                    : 'text-[#736B5E] hover:text-[#1F2A22]'
                }`}
              >
                Ingreso (Abono / Entrada)
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1">
              Monto en Pesos (MXN) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-lg text-[#8C826F]">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-8 pr-4 py-2.5 bg-[#FAF6EC] border-2 border-[#C4B99F] rounded-xl font-mono text-xl font-black text-[#1F2A22] focus:outline-none focus:border-[#2E6F4E] focus:ring-1 focus:ring-[#2E6F4E]"
                autoFocus
              />
            </div>
          </div>

          {/* Description Concept */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1">
              Concepto / Detalle *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Ej. Supermercado semanal, Pago nómina, Cena..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-3.5 py-2.5 bg-[#FAF6EC] border-2 border-[#C4B99F] rounded-xl font-serif text-sm text-[#1F2A22] focus:outline-none focus:border-[#2E6F4E] placeholder-[#A89E8C]"
              />
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1">
                Fecha del Movimiento
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF6EC] border-2 border-[#C4B99F] rounded-xl font-mono text-xs sm:text-sm text-[#1F2A22] focus:outline-none focus:border-[#2E6F4E]"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1">
                Método de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-[#FAF6EC] border-2 border-[#C4B99F] rounded-xl font-sans text-xs sm:text-sm text-[#1F2A22] focus:outline-none focus:border-[#2E6F4E] cursor-pointer"
              >
                <option value="card">Tarjeta de Débito/Crédito</option>
                <option value="transfer">Transferencia SPEI</option>
                <option value="cash">Efectivo</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          {/* Category Selector + Create on the Fly */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono font-bold text-[#595246] uppercase">
                Categoría *
              </label>
              <button
                type="button"
                onClick={onOpenCreateCategory}
                className="text-xs font-serif text-[#2E6F4E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> + Nueva categoría
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-[#F5EFE1] rounded-xl border border-[#D9CEB4]">
              {availableCategories.map((cat) => {
                const isSelected = activeCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs font-sans transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1F2A22] text-[#FAF6EC] font-bold shadow-xs'
                        : 'bg-[#FAF6EC] text-[#595246] hover:bg-[#EFE7D5] border border-[#D9CEB4]'
                    }`}
                  >
                    <CategoryIcon name={cat.iconName} size={14} className={isSelected ? 'text-[#D4AF37]' : ''} />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#E4DAC0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-serif text-[#736B5E] hover:text-[#1F2A22] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-xs sm:text-sm font-serif font-bold text-white rounded-xl shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer ${
                type === 'income' ? 'bg-[#2E6F4E] hover:bg-[#23583E]' : 'bg-[#A33B2E] hover:bg-[#852F24]'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Asentar Movimiento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
