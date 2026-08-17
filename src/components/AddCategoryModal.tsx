import React, { useState } from 'react';
import { X, Check, Tag } from 'lucide-react';
import { TransactionType } from '../types';
import { AVAILABLE_ICONS, CategoryIcon } from './CategoryIcon';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (data: {
    name: string;
    type: TransactionType;
    iconName: string;
    color: string;
    initialLimit?: number;
  }) => void;
  defaultType?: TransactionType;
}

const PALETTE = [
  '#2E6F4E', '#A33B2E', '#D97706', '#2563EB', '#7C3AED',
  '#059669', '#EA580C', '#4F46E5', '#8B5A2B', '#0D9488',
  '#DB2777', '#64748B'
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
  defaultType = 'expense',
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>(defaultType);
  const [iconName, setIconName] = useState('Tag');
  const [color, setColor] = useState(PALETTE[0]);
  const [initialLimit, setInitialLimit] = useState('2000');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresa un nombre para la categoría.');
      return;
    }

    const limit = type === 'expense' ? parseFloat(initialLimit) || 0 : undefined;

    onAddCategory({
      name: name.trim(),
      type,
      iconName,
      color,
      initialLimit: limit,
    });

    setName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF6EC] border-4 border-[#1F2A22] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1F2A22] text-[#FAF6EC] px-6 py-4 flex items-center justify-between border-b-2 border-[#141B16]">
          <h3 className="font-serif font-bold text-lg text-[#FAF6EC]">
            Nueva Partida / Categoría
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#C4B99F] hover:text-[#FAF6EC] rounded-lg transition-colors cursor-pointer"
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

          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1">
              Tipo de Categoría
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#EFE7D5] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-1.5 text-xs font-serif font-bold rounded-lg cursor-pointer transition-colors ${
                  type === 'expense' ? 'bg-[#A33B2E] text-white shadow-xs' : 'text-[#736B5E]'
                }`}
              >
                Egreso (Gasto)
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-1.5 text-xs font-serif font-bold rounded-lg cursor-pointer transition-colors ${
                  type === 'income' ? 'bg-[#2E6F4E] text-white shadow-xs' : 'text-[#736B5E]'
                }`}
              >
                Ingreso
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Mascotas, Reparaciones del Hogar, Cursos..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 bg-[#FAF6EC] border-2 border-[#C4B99F] rounded-xl font-serif text-sm text-[#1F2A22] focus:outline-none focus:border-[#2E6F4E]"
              autoFocus
            />
          </div>

          {/* Initial Budget Limit (for expense only) */}
          {type === 'expense' && (
            <div>
              <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1">
                Límite Presupuestal Mensual (MXN)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-[#8C826F]">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="0.00"
                  value={initialLimit}
                  onChange={(e) => setInitialLimit(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-[#FAF6EC] border-2 border-[#C4B99F] rounded-xl font-mono text-sm font-bold text-[#1F2A22] focus:outline-none focus:border-[#2E6F4E]"
                />
              </div>
            </div>
          )}

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1">
              Ícono Distintivo
            </label>
            <div className="grid grid-cols-6 gap-2 p-2 bg-[#F5EFE1] rounded-xl border border-[#D9CEB4] max-h-28 overflow-y-auto">
              {AVAILABLE_ICONS.map((icon) => {
                const isSelected = iconName === icon;
                return (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setIconName(icon)}
                    className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1F2A22] text-[#FAF6EC] shadow-xs'
                        : 'bg-[#FAF6EC] text-[#595246] hover:bg-[#EFE7D5]'
                    }`}
                  >
                    <CategoryIcon name={icon} size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#595246] uppercase mb-1">
              Color de Tinta
            </label>
            <div className="flex items-center gap-2 flex-wrap p-2 bg-[#F5EFE1] rounded-xl border border-[#D9CEB4]">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-[#1F2A22] ring-offset-1' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              className="px-5 py-2.5 bg-[#2E6F4E] hover:bg-[#23583E] text-white text-xs sm:text-sm font-serif font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Crear Categoría</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
