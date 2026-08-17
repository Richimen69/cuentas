import React from 'react';

interface StampBadgeProps {
  text?: string;
  date?: string;
  size?: 'sm' | 'md' | 'lg';
  rotation?: number;
  className?: string;
}

export const StampBadge: React.FC<StampBadgeProps> = ({
  text = 'PAGADO',
  date,
  size = 'md',
  rotation = -12,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 border-[2px] tracking-widest',
    md: 'text-[13px] px-3 py-1 border-[2.5px] tracking-[0.2em]',
    lg: 'text-[16px] px-4 py-1.5 border-[3.5px] tracking-[0.25em]'
  };

  return (
    <div
      className={`inline-flex flex-col items-center justify-center font-mono font-black text-[#A33B2E] border-[#A33B2E] rounded-md uppercase select-none pointer-events-none transition-transform duration-300 ${sizeClasses[size]} ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        boxShadow: '0 0 0 1px rgba(163, 59, 46, 0.25), inset 0 0 0 1px rgba(163, 59, 46, 0.2)',
        textShadow: '0 0 0.5px rgba(163, 59, 46, 0.6)',
        backgroundColor: 'rgba(163, 59, 46, 0.05)',
      }}
    >
      <div className="flex items-center gap-1">
        <span className="font-mono font-extrabold">{text}</span>
      </div>
      {date && (
        <span className="text-[9px] font-mono tracking-normal font-semibold -mt-0.5 opacity-90">
          {date}
        </span>
      )}
    </div>
  );
};
