import React, { useEffect } from 'react';
import { playWindowsClick } from '../utils/audio';

export interface SystemAlert {
  id: string;
  type: 'check' | 'checkmate' | 'info';
  title?: string;
  message: string;
  autoDismissMs?: number;
}

interface SystemAlertToastProps {
  alert: SystemAlert | null;
  onDismiss: () => void;
}

export const SystemAlertToast: React.FC<SystemAlertToastProps> = ({ alert, onDismiss }) => {
  useEffect(() => {
    if (!alert || !alert.autoDismissMs || alert.autoDismissMs <= 0) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, alert.autoDismissMs);

    return () => clearTimeout(timer);
  }, [alert, onDismiss]);

  if (!alert) return null;

  const handleClose = () => {
    playWindowsClick();
    onDismiss();
  };

  const isCheckmate = alert.type === 'checkmate';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-10 right-3 sm:right-5 z-50 w-[280px] sm:w-[320px] select-none bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#000000] border-r-[#000000] shadow-[4px_4px_0px_rgba(0,0,0,0.6)] p-[2px] animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      {/* Title Bar matching reference image */}
      <div className="bg-[#000080] text-white flex items-center justify-between px-2 py-0.5 select-none">
        <span className="font-mono text-xs font-bold text-white tracking-wide">
          {alert.title || 'System message'}
        </span>
        <button
          onClick={handleClose}
          aria-label="Close"
          className="w-4 h-4 bg-[#c0c0c0] text-black text-[11px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#000000] border-r-[#000000] active:border-t-[#000000] active:border-l-[#000000] active:border-b-[#ffffff] active:border-r-[#ffffff] flex items-center justify-center cursor-pointer leading-none hover:bg-white"
        >
          ×
        </button>
      </div>

      {/* Dialog Body */}
      <div className="p-3 bg-[#c0c0c0]">
        <div className="flex items-center gap-3">
          {/* Authentic 90s/2000s Windows Icon */}
          {isCheckmate ? (
            <div className="shrink-0 w-8 h-8 rounded-full bg-[#cc0000] border-2 border-white flex items-center justify-center text-white font-bold text-lg shadow-[1px_1px_0px_rgba(0,0,0,0.5)]">
              ×
            </div>
          ) : (
            <div className="shrink-0 w-8 h-8 flex items-center justify-center">
              {/* Windows Yellow Warning Triangle */}
              <svg viewBox="0 0 32 32" className="w-8 h-8 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.3)]">
                <polygon points="16,2 30,28 2,28" fill="#ffcc00" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
                <rect x="15" y="10" width="2.5" height="10" fill="#000000" />
                <circle cx="16.25" cy="24" r="1.5" fill="#000000" />
              </svg>
            </div>
          )}

          {/* Text Message */}
          <div className="flex-1 font-sans text-xs sm:text-[13px] text-black font-semibold leading-snug">
            {alert.message}
          </div>
        </div>

        {/* Buttons matching reference image */}
        <div className="flex items-center justify-center gap-3 pt-3 mt-1">
          <button
            onClick={handleClose}
            className="min-w-[68px] px-3 py-1 bg-[#c0c0c0] text-black text-xs font-sans font-medium border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#000000] border-r-[#000000] active:border-t-[#000000] active:border-l-[#000000] active:border-b-[#ffffff] active:border-r-[#ffffff] hover:bg-[#d4d4d4] cursor-pointer text-center focus:outline-none focus:ring-1 focus:ring-black"
          >
            Ok
          </button>
          <button
            onClick={handleClose}
            className="min-w-[68px] px-3 py-1 bg-[#c0c0c0] text-black text-xs font-sans font-medium border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#000000] border-r-[#000000] active:border-t-[#000000] active:border-l-[#000000] active:border-b-[#ffffff] active:border-r-[#ffffff] hover:bg-[#d4d4d4] cursor-pointer text-center focus:outline-none focus:ring-1 focus:ring-black"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
