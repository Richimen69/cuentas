import React, { useState } from 'react';
import { X, Calendar, DollarSign, Tag, Check, Clock, FileText } from 'lucide-react';
import { Category } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface AddFixedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFixedPayment: (data: {
    name: string;
    amount: number;
    dueDay: number;
    categoryId: string;
    notes?: string;
  }) => void;
  categories: Category[];
}

export const AddFixedPaymentModal: React.FC<AddFixedPaymentModalProps> = ({
  isOpen,
  onClose,
  onAddFixedPayment,
  categories,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const activeCategoryId = categoryId || expenseCategories[0]?.id || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numDueDay = parseInt(dueDay.toString(), 10);

    if (!name.trim()) {
      setError('Ingresa el nombre del servicio o compromiso fijo.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Ingresa un monto mensual válido mayor a cero.');
      return;
    }
    if (isNaN(numDueDay) || numDueDay < 1 || numDueDay > 31) {
      setError('El día de vencimiento debe estar entre el 1 y el 31.');
      return;
    }
    if (!activeCategoryId) {
      setError('Selecciona una categoría de gasto.');
      return;
    }

    onAddFixedPayment({
      name: name.trim(),
      amount: numAmount,
      dueDay: numDueDay,
      categoryId: activeCategoryId,
      notes: notes.trim() ? notes.trim() : undefined,
    });

    setName('');
    setAmount('');
    setDueDay(1);
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF6EC] border-4 border-[#1F2A22] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1F2A22] text-[#FAF6EC] px-6 py-4 flex items-center justify-between border-b-2 border-[#141B16]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4AF37]">
              Obligación Recurrente
            </span>
            <h3 className="font-serif font-bold text-lg text-[#FAF6EC]">
              Registrar Pago Fijo Mensual
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FDF2F2] border border-[#A33B2E] text-[#A33B2E] text-xs font-sans rounded-lg">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1">
              Nombre del Pago o Servicio *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Renta depa, Totalplay, Gimnasio SmartFit, Spotify..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 bg-[#FAF6EC] border-2 border-[#C4B99F] rounded-xl font-serif text-sm text-[#1F2A22] focus:outline-none focus:border-[#2E6F4E] placeholder-[#A89E8C]"
              autoFocus
            />
          </div>

          {/* Amount & Due Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Amount */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1">
                Monto Mensual (MXN) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-base text-[#8C826F]">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-[#FAF6EC] border-2 border-[#C4B99F] rounded-xl font-mono text-base font-bold text-[#1F2A22] focus:outline-none focus:border-[#2E6F4E]"
                />
              </div>
            </div>

            {/* Due Day */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1">
                Día de Vencimiento *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={dueDay}
                  onChange={(e) => setDueDay(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-[#FAF6EC] border-2 border-[#C4B99F] rounded-xl font-mono text-base font-bold text-[#1F2A22] focus:outline-none focus:border-[#2E6F4E]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8C826F]">
                  de cada mes
                </span>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1">
              Categoría de Gasto *
            </label>
            <select
              value={activeCategoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#FAF6EC] border-2 border-[#C4B99F] rounded-xl font-sans text-sm text-[#1F2A22] focus:outline-none focus:border-[#2E6F4E] cursor-pointer"
            >
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1">
              Notas / Referencia de Pago (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Transferir a cuenta Banamex, Cargo automático a tarjeta..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#FAF6EC] border-2 border-[#C4B99F] rounded-xl font-sans text-xs sm:text-sm text-[#1F2A22] focus:outline-none focus:border-[#2E6F4E] placeholder-[#A89E8C]"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2.5 bg-[#1F2A22] hover:bg-[#2A392F] text-[#FAF6EC] text-xs sm:text-sm font-serif font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#D4AF37]" />
              <span>Guardar Pago Fijo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
