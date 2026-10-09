import React from 'react';

interface KienTreLogoProps {
  variant?: 'mark-only' | 'horizontal' | 'vertical' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light' | 'white';
  className?: string;
}

export const KienTreLogo: React.FC<KienTreLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  theme = 'dark',
  className = '',
}) => {
  // Dimensions for mark
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Text colors
  const titleColor =
    theme === 'white'
      ? 'text-white'
      : theme === 'dark'
      ? 'text-slate-900'
      : 'text-slate-100';

  const subtitleColor =
    theme === 'white'
      ? 'text-cyan-200'
      : theme === 'dark'
      ? 'text-emerald-700 font-semibold'
      : 'text-slate-400';

  // Vector Logo Icon: Chú Kiến Tri Thức (Architect Ant) & Khối Lục Giác Kiến Tạo
  const renderIcon = () => (
    <div
      className={`${iconSizes[size]} relative shrink-0 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-700 to-cyan-600 p-1 shadow-md shadow-emerald-900/20 flex items-center justify-center transition-transform hover:scale-105`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Hexagon base - Khối tổ kiến bền vững & kiến tạo */}
        <polygon
          points="50,6 88,28 88,72 50,94 12,72 12,28"
          stroke="#ffffff"
          strokeWidth="3.5"
          fill="rgba(255, 255, 255, 0.12)"
          strokeLinejoin="round"
        />

        {/* Ant antennae - Cặp râu tri thức & năng động */}
        <path
          d="M 44,30 Q 36,18 28,20"
          stroke="#fde047"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="28" cy="20" r="2.8" fill="#fde047" />

        <path
          d="M 56,30 Q 64,18 72,20"
          stroke="#fde047"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="72" cy="20" r="2.8" fill="#fde047" />

        {/* Graduation Mortarboard cap (Mũ cử nhân học vị) */}
        <polygon
          points="50,22 74,32 50,42 26,32"
          fill="#0f172a"
          stroke="#38bdf8"
          strokeWidth="1.8"
        />
        {/* Tassel */}
        <path
          d="M 68,34 Q 75,40 76,48"
          stroke="#f59e0b"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="76" cy="48" r="2" fill="#f59e0b" />

        {/* Ant Head */}
        <circle cx="50" cy="45" r="10" fill="#ffffff" />
        {/* Bright Eyes */}
        <circle cx="46" cy="45" r="2.5" fill="#0f172a" />
        <circle cx="47" cy="44" r="0.8" fill="#ffffff" />
        <circle cx="54" cy="45" r="2.5" fill="#0f172a" />
        <circle cx="55" cy="44" r="0.8" fill="#ffffff" />

        {/* Open Book / Kiến tạo tri thức foundation */}
        <path
          d="M 32,74 Q 50,68 50,78 Q 50,68 68,74 L 68,60 Q 50,54 50,64 Q 50,54 32,60 Z"
          fill="#ffffff"
          opacity="0.95"
        />
        {/* Stylized letters 'KT' discreetly on book spine */}
        <path
          d="M 50,64 L 50,78"
          stroke="#059669"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center ${className}`}>{renderIcon()}</div>;
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        {renderIcon()}
        <div>
          <span className={`text-base font-extrabold tracking-tight ${titleColor} block leading-tight`}>
            KIẾN TRẺ
          </span>
          <span className={`text-[10px] uppercase tracking-wider ${subtitleColor} block font-semibold`}>
            Education & Investment
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {renderIcon()}
      <div className="flex flex-col justify-center text-left">
        <div className="flex items-center gap-1.5">
          <span className={`text-base font-extrabold tracking-tight ${titleColor} leading-tight`}>
            KIẾN TRẺ
          </span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            EDU
          </span>
        </div>
        <span className={`text-[10.5px] ${subtitleColor} font-medium tracking-tight block truncate max-w-[210px]`}>
          Kiến tạo tri thức · Vững bước tương lai
        </span>
      </div>
    </div>
  );
};
