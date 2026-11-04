import React from 'react';

interface ChessClockProps {
  timeMs: number;
  isActive: boolean;
  color: 'w' | 'b';
  isUnlimited?: boolean;
}

export const ChessClock: React.FC<ChessClockProps> = ({
  timeMs,
  isActive,
  color,
  isUnlimited = false,
}) => {
  if (isUnlimited) {
    return (
      <div className="bg-black text-[#33ff33] font-mono text-sm px-2.5 py-1 border-2 border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff] shadow-inner tracking-wider select-none">
        CASUAL
      </div>
    );
  }

  const totalSeconds = Math.max(0, Math.floor(timeMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((Math.max(0, timeMs) % 1000) / 100);

  const isLowTime = totalSeconds < 30;
  const isCriticalTime = totalSeconds < 10;

  let timeString = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  if (isCriticalTime && isActive) {
    timeString = `${seconds}.${tenths}`;
  }

  return (
    <div
      className={`px-3 py-1 font-mono text-base font-bold tracking-widest select-none border-2 border-t-[#404040] border-l-[#404040] border-b-[#ffffff] border-r-[#ffffff] ${
        isActive
          ? isLowTime
            ? 'bg-black text-[#ff3333] animate-pulse ring-1 ring-red-500'
            : 'bg-black text-[#ffff00]'
          : 'bg-[#181818] text-[#808080]'
      }`}
      style={{
        textShadow: isActive ? (isLowTime ? '0 0 4px #ff0000' : '0 0 4px #ffff00') : 'none',
      }}
    >
      {timeString}
    </div>
  );
};
