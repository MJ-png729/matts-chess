import React from 'react';

export interface MsnEmoticonDef {
  id: string;
  shortcut: string;
  label: string;
  aliases: string[];
}

export const MSN_EMOTICONS: MsnEmoticonDef[] = [
  { id: 'smile', shortcut: ':-)', label: 'smile', aliases: [':)', '😊', '🙂', '😀'] },
  { id: 'big_grin', shortcut: ':-D', label: 'big grin', aliases: [':D', ':d', '😃', '😄'] },
  { id: 'wink', shortcut: ';-)', label: 'wink', aliases: [';)', '😉'] },
  { id: 'mixed', shortcut: ':-/', label: 'mixed', aliases: [':/', ':-~', '😕', '😐'] },
  { id: 'thoughtful', shortcut: 'V-.', label: 'thoughtful', aliases: ['v-.', '🤔'] },
  { id: 'tongueout', shortcut: ':-P', label: 'tongueout', aliases: [':-p', ':P', ':p', '😋', '😛', '😜'] },
  { id: 'cool', shortcut: 'B-)', label: 'cool', aliases: ['b-)', '😎'] },
  { id: 'approve', shortcut: '^-)', label: 'approve', aliases: ['^)', '😏'] },
  { id: 'wide_eyes', shortcut: '8-)', label: 'wide eyes', aliases: ['8)', '😳', '🧐'] },
  { id: 'clown', shortcut: ':o)', label: 'clown', aliases: [':O)', '🤡'] },
  { id: 'sad', shortcut: ':-(', label: 'sad', aliases: [':(', '☹️', '🙁', '😢', '😭'] },
  { id: 'shy', shortcut: '8-.', label: 'shy', aliases: ['8.', '🥺', '🙈'] },
  { id: 'blush', shortcut: ':-I', label: 'blush', aliases: [':-i', ':I', '😊', '😳'] },
  { id: 'kiss', shortcut: ':-X', label: 'kiss', aliases: [':-x', ':X', ':x', '😘', '😚'] },
  { id: 'surprise', shortcut: '8-o', label: 'surprise', aliases: ['8-O', ':-O', ':-o', ':O', ':o', '😮', '😲'] },
];

export const MsnIcon: React.FC<{ id: string; size?: number; className?: string }> = ({
  id,
  size = 19,
  className = '',
}) => {
  const s = size;

  switch (id) {
    case 'smile':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <ellipse cx="6.5" cy="5.5" rx="3" ry="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="7" cy="8.5" r="1.3" fill="#221100" />
          <circle cx="13" cy="8.5" r="1.3" fill="#221100" />
          <path d="M 6 12 Q 10 16 14 12" stroke="#221100" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'big_grin':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <ellipse cx="6.5" cy="5.5" rx="3" ry="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="7" cy="8" r="1.3" fill="#221100" />
          <circle cx="13" cy="8" r="1.3" fill="#221100" />
          <path d="M 5.5 11 Q 10 11.5 14.5 11 C 14.5 15.5 5.5 15.5 5.5 11 Z" fill="#ffffff" stroke="#221100" strokeWidth="1.2" />
          <line x1="6" y1="12" x2="14" y2="12" stroke="#d0d0d0" strokeWidth="0.8" />
        </svg>
      );

    case 'wink':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <ellipse cx="6.5" cy="5.5" rx="3" ry="1.5" fill="#ffffff" opacity="0.6" />
          <path d="M 5 8.5 Q 7 10 9 8.5" stroke="#221100" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <circle cx="13" cy="8.5" r="1.3" fill="#221100" />
          <path d="M 6.5 12 Q 10 16 13.5 12" stroke="#221100" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'mixed':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <ellipse cx="6.5" cy="5.5" rx="3" ry="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="7" cy="8.5" r="1.3" fill="#221100" />
          <circle cx="13" cy="8.5" r="1.3" fill="#221100" />
          <line x1="6.5" y1="14" x2="13.5" y2="12" stroke="#221100" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    case 'thoughtful':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <ellipse cx="6.5" cy="5.5" rx="3" ry="1.5" fill="#ffffff" opacity="0.6" />
          <path d="M 5.5 6 L 8.5 7.5" stroke="#331100" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 14.5 6 L 11.5 7.5" stroke="#331100" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="7" cy="9" r="1.3" fill="#221100" />
          <circle cx="13" cy="9" r="1.3" fill="#221100" />
          <path d="M 8 13.5 Q 10 12.5 12 13.5" stroke="#221100" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'tongueout':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <ellipse cx="6.5" cy="5.5" rx="3" ry="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="7" cy="8" r="1.3" fill="#221100" />
          <circle cx="13" cy="8" r="1.3" fill="#221100" />
          <line x1="6" y1="11.5" x2="14" y2="11.5" stroke="#221100" strokeWidth="1.3" />
          <path d="M 9 11.5 C 9 16 13 16 13 11.5 Z" fill="#ff4d6d" stroke="#aa0022" strokeWidth="0.8" />
          <line x1="11" y1="12" x2="11" y2="14.5" stroke="#cc1133" strokeWidth="0.6" />
        </svg>
      );

    case 'cool':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <path d="M 3.5 7.5 C 4 11 8.5 11 8.5 7.5 Z" fill="#151515" stroke="#000" strokeWidth="0.8" />
          <path d="M 11.5 7.5 C 11.5 11 16 11 16.5 7.5 Z" fill="#151515" stroke="#000" strokeWidth="0.8" />
          <line x1="8.5" y1="8" x2="11.5" y2="8" stroke="#000" strokeWidth="1.2" />
          <line x1="5" y1="8.5" x2="7.5" y2="9.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
          <line x1="13" y1="8.5" x2="15.5" y2="9.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
          <path d="M 7.5 13.5 Q 11 15.5 13.5 13" stroke="#221100" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'approve':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <ellipse cx="6.5" cy="5.5" rx="3" ry="1.5" fill="#ffffff" opacity="0.6" />
          <path d="M 5 6 Q 7 4.5 9 6.5" stroke="#221100" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <circle cx="7" cy="8.5" r="1.3" fill="#221100" />
          <circle cx="13" cy="8.5" r="1.3" fill="#221100" />
          <path d="M 7 13 Q 10.5 15 13.5 12" stroke="#221100" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'wide_eyes':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <circle cx="6.5" cy="8.5" r="2.8" fill="#ffffff" stroke="#221100" strokeWidth="0.9" />
          <circle cx="13.5" cy="8.5" r="2.8" fill="#ffffff" stroke="#221100" strokeWidth="0.9" />
          <circle cx="6.8" cy="8.5" r="1.2" fill="#000000" />
          <circle cx="13.8" cy="8.5" r="1.2" fill="#000000" />
          <line x1="7.5" y1="14" x2="12.5" y2="14" stroke="#221100" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 'clown':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="#f8f8f8" stroke="#606060" strokeWidth="1" />
          <polygon points="7,5 5.5,8 8.5,8" fill="#3388ff" />
          <polygon points="13,5 11.5,8 14.5,8" fill="#3388ff" />
          <circle cx="10" cy="9.5" r="2.2" fill="#e60000" stroke="#990000" strokeWidth="0.8" />
          <circle cx="9.5" cy="9" r="0.6" fill="#ffffff" />
          <path d="M 5 12 Q 10 17 15 12" stroke="#d00000" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'sad':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-blue)" stroke="#39487c" strokeWidth="1" />
          <ellipse cx="6.5" cy="5.5" rx="3" ry="1.5" fill="#ffffff" opacity="0.4" />
          <circle cx="7" cy="8.5" r="1.3" fill="#152040" />
          <circle cx="13" cy="8.5" r="1.3" fill="#152040" />
          <path d="M 6.5 14.5 Q 10 11 13.5 14.5" stroke="#152040" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'shy':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <circle cx="6.5" cy="8.5" r="2.2" fill="#ffffff" stroke="#221100" strokeWidth="0.8" />
          <circle cx="13.5" cy="8.5" r="2.2" fill="#ffffff" stroke="#221100" strokeWidth="0.8" />
          <circle cx="6.5" cy="9.5" r="1.1" fill="#221100" />
          <circle cx="13.5" cy="9.5" r="1.1" fill="#221100" />
          <circle cx="4.5" cy="11.5" r="1.6" fill="#ff7799" opacity="0.75" />
          <circle cx="15.5" cy="11.5" r="1.6" fill="#ff7799" opacity="0.75" />
          <path d="M 8 13.5 Q 10 15 12 13.5" stroke="#221100" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'blush':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <circle cx="7" cy="8" r="1.3" fill="#221100" />
          <circle cx="13" cy="8" r="1.3" fill="#221100" />
          <ellipse cx="5" cy="11" rx="2.2" ry="1.4" fill="#ff5577" opacity="0.8" />
          <ellipse cx="15" cy="11" rx="2.2" ry="1.4" fill="#ff5577" opacity="0.8" />
          <line x1="7.5" y1="13.5" x2="12.5" y2="13.5" stroke="#221100" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'kiss':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <ellipse cx="6.5" cy="5.5" rx="3" ry="1.5" fill="#ffffff" opacity="0.6" />
          <path d="M 5 8 Q 7 6.5 9 8" stroke="#221100" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M 11 8 Q 13 6.5 15 8" stroke="#221100" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <ellipse cx="10" cy="13.2" rx="1.6" ry="1.2" fill="#ff2255" stroke="#990022" strokeWidth="0.6" />
        </svg>
      );

    case 'surprise':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <ellipse cx="6.5" cy="5.5" rx="3" ry="1.5" fill="#ffffff" opacity="0.6" />
          <path d="M 5.5 5.5 Q 7 4.5 8.5 5.5" stroke="#221100" strokeWidth="1.1" fill="none" />
          <path d="M 11.5 5.5 Q 13 4.5 14.5 5.5" stroke="#221100" strokeWidth="1.1" fill="none" />
          <circle cx="7" cy="8" r="1.3" fill="#221100" />
          <circle cx="13" cy="8" r="1.3" fill="#221100" />
          <ellipse cx="10" cy="13.5" rx="2" ry="2.6" fill="#221100" />
        </svg>
      );

    default:
      return null;
  }
};

/** Global SVG definitions for gradients used across all MSN smilies */
export const MsnGradientsDefs: React.FC = () => (
  <svg width="0" height="0" className="absolute" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
    <defs>
      <radialGradient id="msn-yellow" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#ffffbb" />
        <stop offset="35%" stopColor="#ffdb2d" />
        <stop offset="85%" stopColor="#e5a100" />
        <stop offset="100%" stopColor="#ba7600" />
      </radialGradient>
      <radialGradient id="msn-blue" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#dce8ff" />
        <stop offset="40%" stopColor="#8ba5e8" />
        <stop offset="85%" stopColor="#536ebd" />
        <stop offset="100%" stopColor="#354b8e" />
      </radialGradient>
    </defs>
  </svg>
);

/**
 * Parses message text and turns any MSN emoticon shortcut or unicode smiley into an inline MSN smiley
 */
export const FormattedChatMessage: React.FC<{ text: string }> = ({ text }) => {
  const words = text.split(/(\s+)/);

  return (
    <>
      {words.map((chunk, idx) => {
        const trimmed = chunk.trim();
        if (trimmed) {
          for (const emo of MSN_EMOTICONS) {
            if (
              trimmed === emo.shortcut ||
              emo.aliases.includes(trimmed) ||
              trimmed.toUpperCase() === emo.shortcut.toUpperCase()
            ) {
              return (
                <span
                  key={`${idx}-${emo.id}`}
                  className="inline-block mx-0.5 align-middle select-none"
                  title={`${emo.shortcut} (${emo.label})`}
                >
                  <MsnIcon id={emo.id} size={18} />
                </span>
              );
            }
          }
        }
        return <span key={idx}>{chunk}</span>;
      })}
    </>
  );
};

/**
 * Authentic MSN Messenger "Insert emoticon" dialog window matching user reference image
 */
export const InsertEmoticonDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (shortcut: string) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-10 right-0 z-50 w-64 sm:w-72 bg-[#f0eee8] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] shadow-[3px_3px_0px_rgba(0,0,0,0.5)] select-none font-sans"
    >
      {/* XP / MSN Messenger Gradient Titlebar */}
      <div className="bg-gradient-to-r from-[#6e8ba7] via-[#7d9cb8] to-[#92b0cb] text-white font-bold text-xs px-2 py-1 flex items-center justify-between border-b border-[#557799]">
        <span className="text-[11px] font-bold tracking-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
          Insert emoticon
        </span>
        <button
          onClick={onClose}
          type="button"
          className="w-4 h-4 bg-[#d4d0c8] text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] flex items-center justify-center hover:bg-white active:scale-95 cursor-pointer leading-none"
          title="Close"
        >
          ×
        </button>
      </div>

      {/* Emoticon List Table */}
      <div className="max-h-72 overflow-y-auto p-1 bg-[#ece9d8] border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] m-1 text-xs">
        <div className="divide-y divide-[#dfdcce]">
          {MSN_EMOTICONS.map((emo) => (
            <button
              key={emo.id}
              type="button"
              onClick={() => {
                onSelect(emo.shortcut);
                onClose();
              }}
              className="w-full flex items-center justify-between px-2 py-1 hover:bg-[#316ac5] hover:text-white group text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 flex items-center justify-center">
                  <MsnIcon id={emo.id} size={18} />
                </div>
                <span className="font-mono text-xs text-[#202020] group-hover:text-white font-bold w-12">
                  {emo.shortcut}
                </span>
              </div>
              <span className="text-[11px] text-[#555555] group-hover:text-white font-sans italic">
                {emo.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="px-2 py-1 bg-[#dedad2] border-t border-[#bfb9ae] flex items-center justify-between text-[10px] text-[#505050]">
        <span>Click to insert emoticon</span>
        <button
          onClick={onClose}
          type="button"
          className="px-2 py-0.5 bg-[#d4d0c8] hover:bg-white text-black text-[10px] font-bold border border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
