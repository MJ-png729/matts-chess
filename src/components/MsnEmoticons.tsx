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
  { id: 'laugh', shortcut: 'XD', label: 'tears of joy', aliases: ['xD', '😂', '🤣'] },
  { id: 'wink', shortcut: ';-)', label: 'wink', aliases: [';)', '😉'] },
  { id: 'mixed', shortcut: ':-/', label: 'mixed', aliases: [':/', ':-~', '😕', '😐'] },
  { id: 'thoughtful', shortcut: 'V-.', label: 'thoughtful', aliases: ['v-.', '🤔'] },
  { id: 'tongueout', shortcut: ':-P', label: 'tongueout', aliases: [':-p', ':P', ':p', '😋', '😛', '😜'] },
  { id: 'cool', shortcut: 'B-)', label: 'cool', aliases: ['b-)', '😎'] },
  { id: 'approve', shortcut: '^-)', label: 'approve', aliases: ['^)', '😏'] },
  { id: 'wide_eyes', shortcut: '8-)', label: 'wide eyes', aliases: ['8)', '😳', '🧐'] },
  { id: 'clown', shortcut: ':o)', label: 'clown', aliases: [':O)', '🤡'] },
  { id: 'sad', shortcut: ':-(', label: 'sad', aliases: [':(', '☹️', '🙁', '😢'] },
  { id: 'cry', shortcut: ":'(", label: 'crying', aliases: [':\'-(', '😭', '😿'] },
  { id: 'skull', shortcut: '[skull]', label: 'skull', aliases: ['💀', '☠️', '☠'] },
  { id: 'pray', shortcut: '[pray]', label: 'please', aliases: ['🙏'] },
  { id: 'moai', shortcut: '[moai]', label: 'stone face', aliases: ['🗿'] },
  { id: 'shy', shortcut: '8-.', label: 'shy', aliases: ['8.', '🥺', '🙈'] },
  { id: 'blush', shortcut: ':-I', label: 'blush', aliases: [':-i', ':I'] },
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

    case 'laugh':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <ellipse cx="7" cy="5" rx="3" ry="1.3" fill="#ffffff" opacity="0.6" />
          {/* Squinting happy eyes */}
          <path d="M 5 8.5 Q 7 6.5 9 8.5" stroke="#221100" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M 11 8.5 Q 13 6.5 15 8.5" stroke="#221100" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* Wide laughing mouth */}
          <path d="M 5.5 11 Q 10 11.5 14.5 11 C 14.5 16 5.5 16 5.5 11 Z" fill="#ffffff" stroke="#221100" strokeWidth="1.2" />
          <ellipse cx="10" cy="14" rx="2.5" ry="1" fill="#ff4d6d" />
          {/* MSN cyan tear drops */}
          <path d="M 4 9.5 C 2 10.5 2 12.5 3.5 12.5 C 4.5 12.5 4.8 11 4 9.5 Z" fill="#4cc3ff" stroke="#1b5ea8" strokeWidth="0.7" />
          <path d="M 16 9.5 C 18 10.5 18 12.5 16.5 12.5 C 15.5 12.5 15.2 11 16 9.5 Z" fill="#4cc3ff" stroke="#1b5ea8" strokeWidth="0.7" />
        </svg>
      );

    case 'cry':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          <circle cx="10" cy="10" r="9" fill="url(#msn-yellow)" stroke="#6d5316" strokeWidth="1" />
          <ellipse cx="6.5" cy="5" rx="3" ry="1.4" fill="#ffffff" opacity="0.55" />
          {/* Tight >< eyes */}
          <path d="M 5 7 L 8.2 8.5 L 5 10" stroke="#221100" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 15 7 L 11.8 8.5 L 15 10" stroke="#221100" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Waterfall blue tears */}
          <rect x="5" y="10" width="2.4" height="7" rx="1" fill="#5fd0ff" stroke="#1b5ea8" strokeWidth="0.6" />
          <rect x="12.6" y="10" width="2.4" height="7" rx="1" fill="#5fd0ff" stroke="#1b5ea8" strokeWidth="0.6" />
          {/* Wailing open mouth */}
          <path d="M 7.5 15 C 7.5 11.5 12.5 11.5 12.5 15 Z" fill="#7a1c1c" stroke="#221100" strokeWidth="1.1" />
        </svg>
      );

    case 'skull':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          {/* Retro 3D shaded pixel/vector skull */}
          <path
            d="M 10 2 C 5.2 2 2.5 5 2.5 9 C 2.5 11.5 3.8 13.4 5.5 14.3 L 5.5 17 C 5.5 17.8 6.2 18.2 7 18.2 L 13 18.2 C 13.8 18.2 14.5 17.8 14.5 17 L 14.5 14.3 C 16.2 13.4 17.5 11.5 17.5 9 C 17.5 5 14.8 2 10 2 Z"
            fill="url(#msn-bone)"
            stroke="#222222"
            strokeWidth="1.2"
          />
          <ellipse cx="7" cy="4.5" rx="2.5" ry="1" fill="#ffffff" opacity="0.7" />
          {/* Hollow eye sockets */}
          <circle cx="6.8" cy="9.5" r="2.2" fill="#1e1e24" />
          <circle cx="13.2" cy="9.5" r="2.2" fill="#1e1e24" />
          <circle cx="6.2" cy="8.9" r="0.6" fill="#707880" />
          <circle cx="12.6" cy="8.9" r="0.6" fill="#707880" />
          {/* Nasal cavity */}
          <polygon points="10,11.2 8.9,13.2 11.1,13.2" fill="#1e1e24" />
          {/* Grinning teeth */}
          <line x1="7.5" y1="15.2" x2="7.5" y2="18" stroke="#222222" strokeWidth="1.1" />
          <line x1="10" y1="15.2" x2="10" y2="18" stroke="#222222" strokeWidth="1.1" />
          <line x1="12.5" y1="15.2" x2="12.5" y2="18" stroke="#222222" strokeWidth="1.1" />
        </svg>
      );

    case 'pray':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          {/* Subtle yellow rays */}
          <line x1="10" y1="1" x2="10" y2="3" stroke="#e5a100" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="5.5" y1="2.2" x2="6.8" y2="3.8" stroke="#e5a100" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="14.5" y1="2.2" x2="13.2" y2="3.8" stroke="#e5a100" strokeWidth="1.1" strokeLinecap="round" />
          {/* Left & Right pressed hands */}
          <path
            d="M 9.8 4.2 C 8.5 4.2 7.5 6 6.5 9.5 L 5.2 14.5 L 9.8 14.5 Z"
            fill="url(#msn-yellow)"
            stroke="#6d5316"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path
            d="M 10.2 4.2 C 11.5 4.2 12.5 6 13.5 9.5 L 14.8 14.5 L 10.2 14.5 Z"
            fill="#f4b922"
            stroke="#6d5316"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          {/* Blue cuffs */}
          <polygon points="4.2,14.5 9.8,14.5 9.2,18.2 3.2,17.5" fill="#316ac5" stroke="#1a3b75" strokeWidth="1" />
          <polygon points="10.2,14.5 15.8,14.5 16.8,17.5 10.8,18.2" fill="#2453a1" stroke="#1a3b75" strokeWidth="1" />
        </svg>
      );

    case 'moai':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" className={`inline-block align-middle ${className}`}>
          {/* Beveled carved stone head */}
          <polygon
            points="6,2 14,2 15.5,7 16,14 14.5,18.2 5.5,18.2 4,14 4.5,7"
            fill="url(#msn-stone)"
            stroke="#363b42"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Heavy brow ridge */}
          <polygon points="5,6.2 15,6.2 14.2,8.2 5.8,8.2" fill="#b8bec6" stroke="#4a5058" strokeWidth="0.8" />
          {/* Deep-set eyes */}
          <rect x="6" y="8.2" width="2.6" height="1.8" fill="#2b3036" />
          <rect x="11.4" y="8.2" width="2.6" height="1.8" fill="#2b3036" />
          {/* Long chiseled nose */}
          <polygon points="9.2,7.5 10.8,7.5 11.6,12.8 8.4,12.8" fill="#9ea6b0" stroke="#4a5058" strokeWidth="0.8" />
          {/* Deadpan mouth + chin */}
          <line x1="6.8" y1="15" x2="13.2" y2="15" stroke="#2b3036" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="16.8" x2="12" y2="16.8" stroke="#626973" strokeWidth="1" strokeLinecap="round" />
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
      <radialGradient id="msn-bone" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="60%" stopColor="#e6e2d8" />
        <stop offset="100%" stopColor="#b0aa9c" />
      </radialGradient>
      <linearGradient id="msn-stone" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c8ced6" />
        <stop offset="55%" stopColor="#8f97a3" />
        <stop offset="100%" stopColor="#616873" />
      </linearGradient>
    </defs>
  </svg>
);

// Build sorted lookup table of all emoticon tokens (longest first so :'-( matches before :-()
interface EmoticonTokenEntry {
  token: string;
  isUnicode: boolean;
  emo: MsnEmoticonDef;
}

const EMOTICON_TOKENS: EmoticonTokenEntry[] = (() => {
  const list: EmoticonTokenEntry[] = [];
  for (const emo of MSN_EMOTICONS) {
    const all = [emo.shortcut, ...emo.aliases];
    for (const token of all) {
      const isUnicode = /[^\x00-\x7F]/.test(token);
      list.push({ token, isUnicode, emo });
    }
  }
  return list.sort((a, b) => b.token.length - a.token.length);
})();

function isAsciiBoundary(ch: string | undefined): boolean {
  if (!ch) return true;
  return !/[a-zA-Z0-9_/]/.test(ch);
}

/**
 * Parses message text and turns any MSN emoticon shortcut or unicode smiley (including consecutive or inline ones) into inline MSN smilies
 */
export const FormattedChatMessage: React.FC<{ text: string }> = ({ text }) => {
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let buffer = '';

  while (i < text.length) {
    let matched: EmoticonTokenEntry | null = null;

    for (const entry of EMOTICON_TOKENS) {
      if (entry.isUnicode) {
        if (text.startsWith(entry.token, i)) {
          matched = entry;
          break;
        }
      } else {
        const slice = text.slice(i, i + entry.token.length);
        const matchesAscii =
          entry.token === 'XD' || entry.token === 'xD'
            ? slice.toLowerCase() === 'xd'
            : slice.toUpperCase() === entry.token.toUpperCase();
        if (
          matchesAscii &&
          isAsciiBoundary(i > 0 ? text[i - 1] : undefined) &&
          isAsciiBoundary(i + entry.token.length < text.length ? text[i + entry.token.length] : undefined)
        ) {
          matched = entry;
          break;
        }
      }
    }

    if (matched) {
      if (buffer) {
        nodes.push(<React.Fragment key={`txt-${i}`}>{buffer}</React.Fragment>);
        buffer = '';
      }
      nodes.push(
        <span
          key={`emo-${i}-${matched.emo.id}`}
          className="inline-block mx-0.5 align-middle select-none"
          title={`${matched.emo.shortcut} (${matched.emo.label})`}
        >
          <MsnIcon id={matched.emo.id} size={18} />
        </span>
      );
      i += matched.token.length;
    } else {
      buffer += text[i];
      i += 1;
    }
  }

  if (buffer) {
    nodes.push(<React.Fragment key="txt-end">{buffer}</React.Fragment>);
  }

  return <>{nodes}</>;
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
