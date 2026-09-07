import React from 'react';

interface SpeedSignProps {
  limit: number;
  size?: 'sm' | 'md' | 'lg';
  isExceeded?: boolean;
}

export const SpeedSign: React.FC<SpeedSignProps> = ({ limit, size = 'md', isExceeded = false }) => {
  const sizeClasses = {
    sm: 'w-11 h-11 text-xs border-[3px]',
    md: 'w-16 h-16 text-xl border-[4px]',
    lg: 'w-24 h-24 text-3xl border-[6px]',
  };

  return (
    <div
      id="speed-limit-sign"
      className={`relative inline-flex flex-col items-center justify-center rounded-full bg-black font-mono-num font-bold text-white transition-all duration-200 select-none ${
        sizeClasses[size]
      } ${
        isExceeded
          ? 'border-[#FF4F00] shadow-[0_0_20px_rgba(255,79,0,0.6)] animate-pulse'
          : 'border-[#FF4F00]/80 shadow-[0_0_10px_rgba(255,79,0,0.2)]'
      }`}
    >
      <span className="tracking-tight leading-none text-white font-extrabold">{limit}</span>
      <span className="text-[8px] uppercase font-mono tracking-widest text-[#FF4F00] mt-0.5">
        LIMIT
      </span>
    </div>
  );
};
